import { Router } from "express";
const router = Router();
const ALLOWED_DOMAINS = /^[a-z0-9.-]{3,100}$/i;
const CACHE = new Map();
const TTL = 24 * 60 * 60 * 1000; // 24h
router.get("/logo/:domain", async (req, res) => {
    const { domain } = req.params;
    if (!ALLOWED_DOMAINS.test(domain)) {
        res.status(400).send("Invalid domain");
        return;
    }
    const cached = CACHE.get(domain);
    if (cached && Date.now() - cached.ts < TTL) {
        res.set("Content-Type", cached.ct);
        res.set("Cache-Control", "public, max-age=86400");
        res.set("X-Logo-Cache", "HIT");
        res.send(cached.buf);
        return;
    }
    const sources = [
        `https://logo.clearbit.com/${domain}`,
        `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=128`,
    ];
    for (const url of sources) {
        try {
            const r = await fetch(url, { signal: AbortSignal.timeout(4000) });
            if (!r.ok)
                continue;
            const ct = r.headers.get("content-type") ?? "image/png";
            if (!ct.startsWith("image/"))
                continue;
            const buf = Buffer.from(await r.arrayBuffer());
            if (buf.length < 200)
                continue;
            CACHE.set(domain, { buf, ct, ts: Date.now() });
            res.set("Content-Type", ct);
            res.set("Cache-Control", "public, max-age=86400");
            res.set("X-Logo-Source", url.includes("clearbit") ? "clearbit" : "gstatic");
            res.send(buf);
            return;
        }
        catch {
            continue;
        }
    }
    res.status(404).send("Logo not found");
});
export default router;
//# sourceMappingURL=logo_proxy.js.map