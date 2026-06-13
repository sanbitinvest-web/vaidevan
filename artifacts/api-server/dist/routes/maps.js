import { Router } from "express";
const router = Router();
const MAX_ADDRESS_LEN = 500;
const MAX_WAYPOINTS = 18;
const RATE_WINDOW_MS = 60_000;
const autocompleteHits = new Map();
const directionsHits = new Map();
const AUTOCOMPLETE_RATE_LIMIT = 30;
const DIRECTIONS_RATE_LIMIT = 5;
function checkRateLimitBucket(bucket, limit, ip) {
    const now = Date.now();
    const entry = bucket.get(ip);
    if (!entry || now > entry.resetAt) {
        bucket.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
        return true;
    }
    if (entry.count >= limit)
        return false;
    entry.count++;
    return true;
}
function isValidAddress(value) {
    return typeof value === "string" && value.trim().length > 0 && value.length <= MAX_ADDRESS_LEN;
}
const COORD_RE = /^(-?\d{1,3}(?:\.\d+)?),(-?\d{1,3}(?:\.\d+)?)$/;
async function geocode(address) {
    const coordMatch = COORD_RE.exec(address.trim());
    if (coordMatch) {
        const lat = parseFloat(coordMatch[1]);
        const lon = parseFloat(coordMatch[2]);
        if (!isNaN(lat) && !isNaN(lon))
            return [lon, lat];
    }
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&countrycodes=br`;
    try {
        const res = await fetch(url, {
            headers: { "User-Agent": "VaideVan/1.0 (vaidevan.com)" },
            signal: AbortSignal.timeout(8000),
        });
        if (!res.ok)
            return null;
        const data = await res.json();
        if (!data.length)
            return null;
        return [parseFloat(data[0].lon), parseFloat(data[0].lat)];
    }
    catch {
        return null;
    }
}
router.get("/maps/autocomplete", async (req, res) => {
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim()
        ?? req.socket.remoteAddress
        ?? "unknown";
    if (!checkRateLimitBucket(autocompleteHits, AUTOCOMPLETE_RATE_LIMIT, ip)) {
        res.status(429).json({ error: "Too many requests. Please try again later." });
        return;
    }
    const { q } = req.query;
    if (!isValidAddress(q) || q.trim().length < 3) {
        res.status(400).json({ error: "q must be at least 3 characters" });
        return;
    }
    try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5&countrycodes=br&addressdetails=0`;
        const nominatimRes = await fetch(url, {
            headers: { "User-Agent": "VaideVan/1.0 (vaidevan.com)" },
            signal: AbortSignal.timeout(5000),
        });
        if (!nominatimRes.ok) {
            res.status(502).json({ error: "Geocoding service unavailable" });
            return;
        }
        const data = await nominatimRes.json();
        res.json({ results: data.map(item => ({ label: item.display_name, lat: item.lat, lon: item.lon })) });
    }
    catch {
        res.status(502).json({ error: "Failed to fetch suggestions" });
    }
});
router.get("/maps/directions", async (req, res) => {
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim()
        ?? req.socket.remoteAddress
        ?? "unknown";
    if (!checkRateLimitBucket(directionsHits, DIRECTIONS_RATE_LIMIT, ip)) {
        res.status(429).json({ error: "Too many requests. Please try again later." });
        return;
    }
    const { origin, destination, waypoints } = req.query;
    if (!isValidAddress(origin) || !isValidAddress(destination)) {
        res.status(400).json({ error: "origin and destination are required and must be valid addresses" });
        return;
    }
    const allStops = [origin];
    if (typeof waypoints === "string" && waypoints.length > 0) {
        const wpts = waypoints.split("|").slice(0, MAX_WAYPOINTS).filter(s => isValidAddress(s));
        allStops.push(...wpts);
    }
    allStops.push(destination);
    try {
        const coords = await Promise.all(allStops.map(geocode));
        const failedIdx = coords.findIndex(c => c === null);
        if (failedIdx !== -1) {
            res.status(422).json({
                status: "ZERO_RESULTS",
                error: `Could not find address: "${allStops[failedIdx]}"`,
            });
            return;
        }
        const validCoords = coords;
        const coordStr = validCoords.map(([lng, lat]) => `${lng},${lat}`).join(";");
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson&steps=false`;
        const osrmRes = await fetch(osrmUrl, {
            headers: { "User-Agent": "VaideVan/1.0 (vaidevan.com)" },
            signal: AbortSignal.timeout(10000),
        });
        if (!osrmRes.ok) {
            res.status(502).json({ status: "ERROR", error: "Routing service unavailable" });
            return;
        }
        const osrmData = await osrmRes.json();
        if (osrmData.code !== "Ok" || !osrmData.routes?.length) {
            // With 3+ stops, try to narrow down which leg is failing
            if (validCoords.length >= 3) {
                let failedStopIndex;
                for (let i = 0; i < validCoords.length - 1; i++) {
                    const legCoordStr = `${validCoords[i][0]},${validCoords[i][1]};${validCoords[i + 1][0]},${validCoords[i + 1][1]}`;
                    const legUrl = `https://router.project-osrm.org/route/v1/driving/${legCoordStr}?overview=false&steps=false`;
                    try {
                        const legRes = await fetch(legUrl, {
                            headers: { "User-Agent": "VaideVan/1.0 (vaidevan.com)" },
                            signal: AbortSignal.timeout(8000),
                        });
                        if (legRes.ok) {
                            const legData = await legRes.json();
                            if (legData.code !== "Ok") {
                                failedStopIndex = i + 1;
                                break;
                            }
                        }
                    }
                    catch {
                        // skip this leg probe on timeout/network error
                    }
                }
                res.status(422).json({
                    status: "ZERO_RESULTS",
                    code: "NO_ROUTE",
                    error: "NO_ROUTE",
                    ...(failedStopIndex !== undefined ? { failedStopIndex } : {}),
                });
            }
            else {
                res.status(422).json({ status: "ZERO_RESULTS", code: "NO_ROUTE", error: "NO_ROUTE" });
            }
            return;
        }
        const route = osrmData.routes[0];
        const legs = route.legs.map(leg => ({
            distance: { value: Math.round(leg.distance) },
            duration: { value: Math.round(leg.duration) },
        }));
        res.json({
            status: "OK",
            routes: [{
                    legs,
                    geometry: route.geometry,
                    waypoints: osrmData.waypoints?.map(w => ({ location: w.location }))
                        ?? validCoords.map(c => ({ location: c })),
                }],
        });
    }
    catch {
        res.status(502).json({ status: "ERROR", error: "Failed to compute route" });
    }
});
function formatNominatimLabel(item) {
    const a = item.address ?? {};
    const parts = [];
    if (a.road) {
        parts.push(a.house_number ? `${a.road}, ${a.house_number}` : a.road);
    }
    const neighbourhood = a.neighbourhood ?? a.suburb ?? "";
    if (neighbourhood)
        parts.push(neighbourhood);
    const city = a.city ?? a.town ?? a.village ?? "";
    if (city)
        parts.push(city);
    if (a.state)
        parts.push(a.state);
    return parts.length > 0 ? parts.join(", ") : item.display_name.split(",").slice(0, 4).join(",").trim();
}
// ─── Tile proxy ────────────────────────────────────────────────────────────
// Proxies CartoDB dark tiles server-side so sandbox DNS restrictions don't
// prevent the map from rendering in the Replit preview iframe.
const tileCache = new Map();
const TILE_CACHE_TTL = 1000 * 60 * 60 * 24; // 24 h
router.get("/maps/tiles/:z/:x/:y", async (req, res) => {
    const z = String(req.params["z"] ?? "");
    const x = String(req.params["x"] ?? "");
    const y = String(req.params["y"] ?? "");
    // Validate numeric params to prevent SSRF
    if (!/^\d+$/.test(z) || !/^\d+$/.test(x) || !/^\d+$/.test(y)) {
        res.status(400).json({ error: "Invalid tile coordinates" });
        return;
    }
    const zn = parseInt(z, 10);
    const xn = parseInt(x, 10);
    const yn = parseInt(y, 10);
    if (zn < 0 || zn > 19 || xn < 0 || yn < 0) {
        res.status(400).json({ error: "Tile out of range" });
        return;
    }
    const cacheKey = `${z}/${x}/${y}`;
    const cached = tileCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < TILE_CACHE_TTL) {
        res.setHeader("Content-Type", cached.ct);
        res.setHeader("Cache-Control", "public, max-age=86400");
        res.send(cached.buf);
        return;
    }
    const subdomain = ["a", "b", "c", "d"][Math.abs(xn + yn) % 4];
    const tileUrl = `https://${subdomain}.basemaps.cartocdn.com/dark_all/${z}/${x}/${y}.png`;
    try {
        const upstream = await fetch(tileUrl, {
            headers: {
                "User-Agent": "VaideVan/1.0 (vaidevan.com)",
                "Accept": "image/png,image/*",
            },
            signal: AbortSignal.timeout(8000),
        });
        if (!upstream.ok) {
            res.status(upstream.status).end();
            return;
        }
        const ct = upstream.headers.get("content-type") ?? "image/png";
        const buf = Buffer.from(await upstream.arrayBuffer());
        tileCache.set(cacheKey, { buf, ct, ts: Date.now() });
        res.setHeader("Content-Type", ct);
        res.setHeader("Cache-Control", "public, max-age=86400");
        res.send(buf);
    }
    catch {
        res.status(502).end();
    }
});
export default router;
//# sourceMappingURL=maps.js.map