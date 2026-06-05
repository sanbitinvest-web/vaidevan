import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Clock, Route, Phone, Plus, Minus, Loader2, MapPin, Star, CornerDownRight, Check, Users } from "lucide-react";
import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
import { AddressAutocomplete } from "./AddressAutocomplete";
import type { SelectedPlace } from "./AddressAutocomplete";
import { useFavorites } from "../hooks/useFavorites";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const _API_BASE = ((import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, ""))
  ?? "/api";

interface AutocompleteSuggestion {
  label: string;
  lat: string;
  lon: string;
}

import { waLink, WA_BASE } from "@/lib/waLink";

interface VehicleOption {
  id: string;
  label: string;
  short: string;
  pricePerKm: number;
  minFare: number;
}

const VEHICLES: VehicleOption[] = [
  { id: "carro",    label: "Carro",                     short: "Carro",       pricePerKm: 5.00, minFare: 120 },
  { id: "minivan",  label: "MiniVan — 7 ocupantes",     short: "MiniVan 7",   pricePerKm: 5.30, minFare: 180 },
  { id: "van15",    label: "Van Executiva — 15 ocup.",   short: "Van 15",      pricePerKm: 5.60, minFare: 250 },
  { id: "van19",    label: "Van Executiva — 19 ocup.",   short: "Van 19",      pricePerKm: 5.80, minFare: 300 },
  { id: "limovan",  label: "LimoVan — 8 ocupantes",     short: "LimoVan 8",   pricePerKm: 6.00, minFare: 350 },
  { id: "jetvan",   label: "JetVan — 6 a 7 ocup.",      short: "JetVan 6-7",  pricePerKm: 6.00, minFare: 350 },
  { id: "micro",    label: "Microônibus — 30 ocup.",     short: "Microôn. 30", pricePerKm: 6.00, minFare: 400 },
];

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  return `${m} min`;
}

function formatDistance(meters: number): string {
  const km = meters / 1000;
  return km < 1 ? `${meters}m` : `${km.toFixed(1)} km`;
}

function estimatePrice(meters: number, durationSeconds: number, vehicle: VehicleOption): string {
  const km = meters / 1000;
  const kmCost = km * vehicle.pricePerKm;
  const timeCostPerMin = 0.575;
  const timeCost = (durationSeconds / 60) * timeCostPerMin;
  const total = Math.max(vehicle.minFare, Math.round(kmCost + timeCost));
  return `R$ ${total.toLocaleString("pt-BR")}`;
}

function getMultiStopWA(stops: string[], lang?: string): string {
  const valid = stops.filter(s => s.trim());
  if (valid.length === 0) return waLink("route", lang ?? "pt");
  const isEn = lang?.startsWith("en");
  const isEs = lang?.startsWith("es");
  const labels = valid.map((s, i) => {
    const origin = isEn ? "📍 Origin" : isEs ? "📍 Origen" : "📍 Origem";
    const dest   = isEn ? "🏁 Destination" : isEs ? "🏁 Destino" : "🏁 Destino";
    const stop   = isEn ? `📌 Stop ${i}` : isEs ? `📌 Parada ${i}` : `📌 Parada ${i}`;
    return `${i === 0 ? origin : i === valid.length - 1 ? dest : stop}: ${s}`;
  }).join("\n");
  const msg = isEn
    ? `Hi! I'd like a quote for the following route:\n\n${labels}\n\nCould you send me the price and estimated time?`
    : isEs
    ? `¡Hola! Me gustaría un presupuesto para la siguiente ruta:\n\n${labels}\n\n¿Pueden enviarme el valor y el tiempo estimado?`
    : `Olá! Gostaria de um orçamento para a seguinte rota:\n\n${labels}\n\nPode me enviar o valor e o tempo estimado?`;
  return `${WA_BASE}${encodeURIComponent(msg)}`;
}

type LatLng = [number, number];

interface RouteResult {
  distance: string;
  duration: string;
  price: string;
  distanceMeters: number;
  durationSeconds: number;
  polyline: LatLng[];
  waypoints: LatLng[];
}

type GeoJSONLineString = {
  type: string;
  coordinates: [number, number][];
};

type ApiResponse = {
  status: string;
  routes?: Array<{
    legs: Array<{ distance: { value: number }; duration: { value: number } }>;
    geometry?: GeoJSONLineString;
    waypoints?: Array<{ location: [number, number] }>;
  }>;
};

async function fetchRouteInfo(origin: string, destination: string, waypoints: string[]): Promise<RouteResult> {
  const params = new URLSearchParams({ origin, destination });
  if (waypoints.length > 0) params.set("waypoints", waypoints.join("|"));
  const url = `${_API_BASE}/maps/directions?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    let apiError = "fetch failed";
    try {
      const body = await res.json() as { error?: string; code?: string; failedStopIndex?: number };
      if (body.error) apiError = body.error;
      if (body.code === "NO_ROUTE" && body.failedStopIndex !== undefined) {
        apiError = `NO_ROUTE:${body.failedStopIndex}`;
      }
    } catch { /* ignore parse errors */ }
    throw new Error(apiError);
  }
  const data = await res.json() as ApiResponse;
  if (data.status !== "OK" || !data.routes?.length) throw new Error(data.status || "no routes");
  const route = data.routes[0];
  const legs = route.legs;
  const totalDist = legs.reduce((sum, leg) => sum + (leg.distance?.value ?? 0), 0);
  const totalDur = legs.reduce((sum, leg) => sum + (leg.duration?.value ?? 0), 0);
  const polyline: LatLng[] = (route.geometry?.coordinates ?? []).map(([lng, lat]) => [lat, lng] as LatLng);
  const wpts: LatLng[] = (route.waypoints ?? []).map(w => [w.location[1], w.location[0]] as LatLng);
  return {
    distance: formatDistance(totalDist),
    duration: formatDuration(totalDur),
    price: "",
    distanceMeters: totalDist,
    durationSeconds: totalDur,
    polyline,
    waypoints: wpts,
  };
}


// ─── Map markers / helpers ────────────────────────────────────────────────

function StopIcon({ index, total }: { index: number; total: number }) {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const bg = isFirst ? "#F5E642" : isLast ? "#25D366" : "rgba(255,255,255,0.15)";
  const color = isFirst || isLast ? "#000" : "#fff";
  const label = isFirst ? "A" : isLast ? "Z" : String(index);
  return (
    <div
      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
      style={{ background: bg, color }}
    >
      {label}
    </div>
  );
}

function makeMarkerIcon(color: string, letter: string) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:28px;height:28px;border-radius:50% 50% 50% 0;
      background:${color};border:2px solid #fff;
      display:flex;align-items:center;justify-content:center;
      font-size:11px;font-weight:900;color:#000;
      transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,0.4)
    "><span style="transform:rotate(45deg)">${letter}</span></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });
}

function FitBounds({ positions }: { positions: LatLng[] }) {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (positions.length >= 2) {
      map.fitBounds(positions, { padding: [40, 40] });
      fitted.current = true;
    }
  }, [map, positions]);
  return null;
}

function RouteMap({ polyline, waypoints }: { polyline: LatLng[]; waypoints: LatLng[] }) {
  const defaultCenter: LatLng = [-23.5505, -46.6333];
  const hasRoute = polyline.length >= 2;
  const originIcon = makeMarkerIcon("#F5E642", "A");
  const destIcon = makeMarkerIcon("#25D366", "Z");

  return (
    <MapContainer
      center={hasRoute ? polyline[0] : defaultCenter}
      zoom={hasRoute ? 11 : 10}
      style={{ width: "100%", height: "100%", background: "#111" }}
      zoomControl={true}
      scrollWheelZoom={false}
    >
      <TileLayer
        url={`${_API_BASE}/maps/tiles/{z}/{x}/{y}`}
        attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        maxZoom={19}
      />
      {hasRoute && (
        <>
          <Polyline positions={polyline} pathOptions={{ color: "#F5E642", weight: 4, opacity: 0.9 }} />
          {waypoints.length >= 1 && <Marker position={waypoints[0]} icon={originIcon} />}
          {waypoints.length >= 2 && <Marker position={waypoints[waypoints.length - 1]} icon={destIcon} />}
          {waypoints.slice(1, -1).map((wp, i) => (
            <Marker key={i} position={wp} icon={makeMarkerIcon("rgba(255,255,255,0.8)", String(i + 1))} />
          ))}
          <FitBounds positions={polyline} />
        </>
      )}
    </MapContainer>
  );
}

type StopCoords = { lat: string; lon: string } | null;

export function RouteSimulator() {
  const [stops, setStops] = useState<string[]>(["", ""]);
  const [stopCoords, setStopCoords] = useState<StopCoords[]>([null, null]);
  const [routeInfo, setRouteInfo] = useState<RouteResult | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [failedStopIdx, setFailedStopIdx] = useState<number | null>(null);
  const [didYouMean, setDidYouMean] = useState<AutocompleteSuggestion[]>([]);
  const [didYouMeanLoaded, setDidYouMeanLoaded] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("van15");
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();

  const selectedVehicle = VEHICLES.find(v => v.id === selectedVehicleId) ?? VEHICLES[2];
  const estimatedPrice = routeInfo
    ? estimatePrice(routeInfo.distanceMeters, routeInfo.durationSeconds, selectedVehicle)
    : null;

  // Nickname prompt state for the stop-level star button
  const [pendingStop, setPendingStop] = useState<{
    index: number;
    label: string;
    lat: string;
    lon: string;
    nickname: string;
  } | null>(null);
  const stopNicknameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (pendingStop !== null) {
      setTimeout(() => stopNicknameRef.current?.focus(), 0);
    }
  }, [pendingStop]);

  const addStop = useCallback(() => {
    if (stops.length < 20) {
      setStops(s => [...s.slice(0, -1), "", s[s.length - 1]]);
      setStopCoords(c => [...c.slice(0, -1), null, c[c.length - 1]]);
    }
  }, [stops.length]);

  const removeStop = useCallback((i: number) => {
    if (stops.length > 2) {
      setStops(s => s.filter((_, idx) => idx !== i));
      setStopCoords(c => c.filter((_, idx) => idx !== i));
      setFailedStopIdx(prev => {
        if (prev === null) return null;
        if (prev === i) return null;
        return prev > i ? prev - 1 : prev;
      });
      if (failedStopIdx === i) setDidYouMean([]);
      // Clear pending nickname if the removed stop was the one being labeled
      setPendingStop(prev => {
        if (!prev) return null;
        if (prev.index === i) return null;
        if (prev.index > i) return { ...prev, index: prev.index - 1 };
        return prev;
      });
    }
  }, [stops.length, failedStopIdx]);

  const updateStop = useCallback((i: number, val: string) => {
    setStops(s => s.map((v, idx) => idx === i ? val : v));
    setStopCoords(c => c.map((v, idx) => idx === i ? null : v));
    if (failedStopIdx === i) {
      setFailedStopIdx(null);
      setDidYouMean([]);
      setDidYouMeanLoaded(false);
    }
    // Clear stale nickname prompt when the stop text is edited
    setPendingStop(prev => (prev?.index === i ? null : prev));
  }, [failedStopIdx]);

  const onStopSelect = useCallback((i: number, place: SelectedPlace) => {
    setStops(s => s.map((v, idx) => idx === i ? place.label : v));
    setStopCoords(c => c.map((v, idx) =>
      idx === i
        ? (place.lat && place.lon ? { lat: place.lat, lon: place.lon } : null)
        : v
    ));
    if (failedStopIdx === i) {
      setFailedStopIdx(null);
      setDidYouMean([]);
      setDidYouMeanLoaded(false);
    }
    // Clear stale nickname prompt when a new place is selected for this stop
    setPendingStop(prev => (prev?.index === i ? null : prev));
  }, [failedStopIdx]);

  const calculateRouteWith = useCallback(async (stopsArg: string[], stopCoordsArg: StopCoords[]) => {
    const validIdxs = stopsArg.map((s, i) => ({ s: s.trim(), i })).filter(({ s }) => s.length > 0);
    if (validIdxs.length < 2) return;

    const getStopQuery = ({ s, i }: { s: string; i: number }) => {
      const coords = stopCoordsArg[i];
      return (coords && coords.lat && coords.lon) ? `${coords.lat},${coords.lon}` : s;
    };

    const origin = getStopQuery(validIdxs[0]);
    const destination = getStopQuery(validIdxs[validIdxs.length - 1]);
    const waypoints = validIdxs.slice(1, -1).map(getStopQuery);

    setStatus("loading");
    setRouteInfo(null);
    setErrorMsg("");
    setFailedStopIdx(null);
    setDidYouMean([]);
    setDidYouMeanLoaded(false);
    try {
      const result = await fetchRouteInfo(origin, destination, waypoints);
      setRouteInfo(result);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      const raw = err instanceof Error ? err.message : "";
      const match = /Could not find address: "(.+)"/.exec(raw);
      if (match) {
        const failedAddr = match[1];
        const allQueryStops = validIdxs.map(getStopQuery);
        const failedQueryIdx = allQueryStops.findIndex(q => q === failedAddr);
        let resolvedFailedIdx: number | null = null;
        if (failedQueryIdx !== -1) {
          resolvedFailedIdx = validIdxs[failedQueryIdx].i;
          setFailedStopIdx(resolvedFailedIdx);
        }
        setErrorMsg(`Endereço não encontrado: "${failedAddr}"`);
        const queryText = resolvedFailedIdx !== null ? stopsArg[resolvedFailedIdx].trim() : failedAddr;
        if (queryText.length >= 3) {
          try {
            const res = await fetch(`${_API_BASE}/maps/autocomplete?q=${encodeURIComponent(queryText)}`);
            const data = await res.json() as { results?: AutocompleteSuggestion[] };
            setDidYouMean((data.results ?? []).slice(0, 3));
          } catch {
            setDidYouMean([]);
          }
          setDidYouMeanLoaded(true);
        } else {
          setDidYouMeanLoaded(true);
        }
      } else if (raw === "NO_ROUTE" || raw.startsWith("NO_ROUTE:")) {
        const stopIdxPart = raw.startsWith("NO_ROUTE:") ? raw.slice("NO_ROUTE:".length) : null;
        const apiStopIdx = stopIdxPart !== null ? parseInt(stopIdxPart, 10) : NaN;
        if (!isNaN(apiStopIdx) && apiStopIdx >= 0 && apiStopIdx < validIdxs.length) {
          const uiStopIdx = validIdxs[apiStopIdx].i;
          setFailedStopIdx(uiStopIdx);
          const label = stopsArg[uiStopIdx]?.trim();
          const stopName = label ? `"${label}"` : `parada ${uiStopIdx + 1}`;
          setErrorMsg(`Não foi possível traçar uma rota passando por ${stopName}. Verifique se este ponto tem acesso viário ou tente um endereço próximo.`);
        } else if (validIdxs.length > 2) {
          setErrorMsg("Não foi possível traçar uma rota entre um ou mais dos pontos informados. Verifique se há conexão viária entre as paradas.");
        } else {
          setErrorMsg("Não foi possível traçar uma rota entre os endereços informados. Verifique se há conexão viária entre os pontos.");
        }
      } else if (raw === "Routing service unavailable" || raw === "Failed to compute route") {
        setErrorMsg("O serviço de rotas está temporariamente indisponível. Tente novamente em alguns instantes.");
      } else {
        setErrorMsg("Não foi possível calcular a rota. Verifique os endereços e tente novamente.");
      }
    }
  }, []);

  const calculateRoute = useCallback(async () => {
    return calculateRouteWith(stops, stopCoords);
  }, [stops, stopCoords, calculateRouteWith]);

  const { i18n } = useTranslation();
  const routeLang = i18n.language;
  const isEn = routeLang.startsWith("en");
  const isEs = routeLang.startsWith("es");
  const routeConfirmMsg = routeInfo
    ? (isEn
      ? `Hi! I simulated a route on VaideVan's website and would like to confirm the quote:\n\n🚐 Vehicle: ${selectedVehicle.label}\n📍 Origin: ${stops[0]}\n📍 Destination: ${stops[stops.length - 1]}\n📏 Distance: ${routeInfo.distance}\n⏱️ Est. time: ${routeInfo.duration}\n💰 Estimate: ${estimatedPrice ?? ""}\n\nCould you confirm availability and final price?`
      : isEs
      ? `¡Hola! Simulé una ruta en el sitio de VaideVan y me gustaría confirmar el presupuesto:\n\n🚐 Vehículo: ${selectedVehicle.label}\n📍 Origen: ${stops[0]}\n📍 Destino: ${stops[stops.length - 1]}\n📏 Distancia: ${routeInfo.distance}\n⏱️ Tiempo estimado: ${routeInfo.duration}\n💰 Estimación: ${estimatedPrice ?? ""}\n\n¿Pueden confirmar disponibilidad y precio final?`
      : `Olá! Simulei uma rota no site da VaideVan e quero confirmar o orçamento:\n\n🚐 Veículo: ${selectedVehicle.label}\n📍 Origem: ${stops[0]}\n📍 Destino: ${stops[stops.length - 1]}\n📏 Distância: ${routeInfo.distance}\n⏱️ Tempo estimado: ${routeInfo.duration}\n💰 Estimativa: ${estimatedPrice ?? ""}\n\nPode confirmar disponibilidade e preço final?`)
    : null;
  const waConfirm = routeConfirmMsg
    ? `${WA_BASE}${encodeURIComponent(routeConfirmMsg)}`
    : getMultiStopWA(stops, routeLang);

  return (
    <div className="rounded-2xl border border-white/10 bg-card overflow-hidden">
      <div className="p-6 border-b border-white/10">
        <h3 className="font-black text-white text-lg mb-1 flex items-center gap-2">
          <Route className="w-5 h-5 text-primary" /> Simule sua rota
          {stops.length > 2 && (
            <span className="text-xs bg-primary/15 text-primary rounded-full px-2 py-0.5">{stops.length} paradas</span>
          )}
        </h3>
        <p className="text-white/40 text-xs mb-4">Digite o endereço para ver sugestões automáticas</p>

        <div className="space-y-2 mb-4">
          {stops.map((stop, i) => {
            const coords = stopCoords[i];
            const fav = stop.trim()
              ? isFavorite(stop.trim())
              : false;
            const isFailedStop = failedStopIdx === i;
            return (
              <div key={i} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <StopIcon index={i} total={stops.length} />
                  <AddressAutocomplete
                    value={stop}
                    onChange={(val) => updateStop(i, val)}
                    onSelect={(place) => onStopSelect(i, place)}
                    placeholder={
                      i === 0
                        ? "Endereço de origem — Ex: Aeroporto de Guarulhos"
                        : i === stops.length - 1
                        ? "Endereço de destino — Ex: Faria Lima, São Paulo"
                        : `Parada ${i} — Ex: Hotel em Alphaville`
                    }
                    onKeyDown={(e) => e.key === "Enter" && i === stops.length - 1 && calculateRoute()}
                    className={`w-full bg-background border rounded-xl pl-3 pr-8 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none transition-colors ${
                      isFailedStop
                        ? "border-red-500 focus:border-red-400"
                        : "border-white/10 focus:border-primary/50"
                    }`}
                  />
                  {stop.trim() && (fav || (coords?.lat && coords?.lon)) && (
                    <button
                      onClick={() => {
                        if (fav) {
                          removeFavorite(stop.trim());
                          if (pendingStop?.index === i) setPendingStop(null);
                        } else if (pendingStop?.index === i) {
                          // Already showing the prompt — toggle it off
                          setPendingStop(null);
                        } else {
                          setPendingStop({
                            index: i,
                            label: stop.trim(),
                            lat: coords?.lat ?? "",
                            lon: coords?.lon ?? "",
                            nickname: "",
                          });
                        }
                      }}
                      title={fav ? "Remover dos favoritos" : "Salvar endereço favorito"}
                      className={`w-7 h-7 flex items-center justify-center rounded-full transition-all flex-shrink-0 ${
                        fav || pendingStop?.index === i
                          ? "text-primary hover:text-primary/70"
                          : "text-white/25 hover:text-primary hover:bg-primary/10"
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${fav || pendingStop?.index === i ? "fill-primary" : ""}`} />
                    </button>
                  )}
                  {stop.trim() && !(fav || (coords?.lat && coords?.lon)) && (
                    <div className="w-7 h-7 flex-shrink-0" />
                  )}
                  {!stop.trim() && stops.length > 2 && (
                    <div className="w-7 h-7 flex-shrink-0" />
                  )}
                  {stops.length > 2 && (
                    <button
                      onClick={() => removeStop(i)}
                      className="w-7 h-7 flex items-center justify-center rounded-full text-white/25 hover:text-red-400 hover:bg-red-400/10 transition-all flex-shrink-0"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {pendingStop?.index === i && (
                  <div className="ml-8 flex items-center gap-2 mt-1">
                    <Star className="w-3 h-3 text-primary fill-primary flex-shrink-0" />
                    <input
                      ref={stopNicknameRef}
                      type="text"
                      value={pendingStop.nickname}
                      onChange={e => setPendingStop(p => p ? { ...p, nickname: e.target.value } : p)}
                      onKeyDown={e => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addFavorite({
                            label: pendingStop.label,
                            lat: pendingStop.lat,
                            lon: pendingStop.lon,
                            nickname: pendingStop.nickname.trim() || undefined,
                          });
                          setPendingStop(null);
                        } else if (e.key === "Escape") {
                          e.preventDefault();
                          setPendingStop(null);
                        }
                      }}
                      placeholder="Apelido (ex: Casa, Escritório) — opcional"
                      maxLength={32}
                      className="flex-1 text-xs bg-white/8 border border-primary/30 rounded-lg px-2.5 py-1.5 text-white placeholder-white/25 focus:outline-none focus:border-primary"
                    />
                    <button
                      onClick={() => {
                        addFavorite({
                          label: pendingStop.label,
                          lat: pendingStop.lat,
                          lon: pendingStop.lon,
                          nickname: pendingStop.nickname.trim() || undefined,
                        });
                        setPendingStop(null);
                      }}
                      className="flex-shrink-0 p-1.5 rounded-lg bg-primary/20 hover:bg-primary/40 text-primary transition-colors"
                      title="Salvar favorito"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                {isFailedStop && didYouMean.length > 0 && (
                  <div className="ml-8 flex flex-col gap-0.5">
                    <span className="text-[10px] text-white/35 uppercase tracking-widest px-1 select-none">
                      Você quis dizer?
                    </span>
                    {didYouMean.map((sug, si) => (
                      <button
                        key={si}
                        onClick={() => {
                          const newStops = stops.map((v, idx) => idx === i ? sug.label : v);
                          const newCoords = stopCoords.map((v, idx) =>
                            idx === i ? { lat: sug.lat, lon: sug.lon } : v
                          );
                          onStopSelect(i, { label: sug.label, lat: sug.lat, lon: sug.lon });
                          calculateRouteWith(newStops, newCoords);
                        }}
                        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-left text-white/70 hover:text-primary hover:bg-primary/10 transition-colors"
                      >
                        <CornerDownRight className="w-3 h-3 flex-shrink-0 text-white/30" />
                        <span className="truncate">{sug.label}</span>
                      </button>
                    ))}
                  </div>
                )}
                {isFailedStop && didYouMeanLoaded && didYouMean.length === 0 && (
                  <p className="ml-8 text-xs text-white/40 px-1 py-0.5">
                    Tente usar o nome da cidade ou o CEP do endereço.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Vehicle selector */}
        <div className="mb-4">
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
            <Users className="w-3 h-3" /> Tipo de veículo
          </p>
          <div className="flex flex-wrap gap-1.5">
            {VEHICLES.map(v => (
              <button
                key={v.id}
                onClick={() => setSelectedVehicleId(v.id)}
                className="px-3 py-1.5 rounded-full text-xs font-bold border transition-all"
                style={selectedVehicleId === v.id
                  ? { background: "#F5E642", color: "#000", borderColor: "#F5E642" }
                  : { borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.55)" }}
              >
                {v.short}
              </button>
            ))}
          </div>
          <p className="text-white/25 text-[10px] mt-1.5">
            R${selectedVehicle.pricePerKm.toFixed(2).replace(".", ",")}/km · mín. R${selectedVehicle.minFare.toLocaleString("pt-BR")}
          </p>
        </div>

        <div className="flex gap-2 mb-3 flex-wrap">
          {stops.length < 20 && (
            <button
              onClick={addStop}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-white/15 text-white/35 hover:border-primary/40 hover:text-primary text-xs transition-all"
            >
              <Plus className="w-3 h-3" /> Parada
            </button>
          )}
          <button
            onClick={calculateRoute}
            disabled={status === "loading" || stops.filter(s => s.trim()).length < 2}
            className="flex-1 py-2.5 rounded-xl bg-primary text-black font-black text-sm hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {status === "loading"
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Calculando…</>
              : <><Route className="w-4 h-4" /> Calcular Rota</>}
          </button>
        </div>
        {status === "error" && <p className="text-red-400 text-xs mt-1 text-center">{errorMsg}</p>}
      </div>

      <div className="w-full h-72 bg-[#111] relative">
        {status === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/20 pointer-events-none z-10">
            <MapPin className="w-8 h-8" />
            <span className="text-xs">Informe os endereços e calcule a rota</span>
          </div>
        )}
        <RouteMap polyline={routeInfo?.polyline ?? []} waypoints={routeInfo?.waypoints ?? []} />
      </div>

      {routeInfo && (
        <div className="p-6 border-t border-white/10 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-xl bg-background border border-white/10">
              <Route className="w-4 h-4 text-primary mx-auto mb-1" />
              <div className="font-black text-white text-sm">{routeInfo.distance}</div>
              <div className="text-white/40 text-xs">Distância</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-background border border-white/10">
              <Clock className="w-4 h-4 text-primary mx-auto mb-1" />
              <div className="font-black text-white text-sm">{routeInfo.duration}</div>
              <div className="text-white/40 text-xs">Tempo estimado</div>
            </div>
            <div className="text-center p-3 rounded-xl bg-primary/10 border border-primary/30">
              <span className="text-primary text-base font-black block">{estimatedPrice}</span>
              <div className="text-white/40 text-xs">Estimativa*</div>
            </div>
          </div>
          <div className="text-center text-xs text-white/35 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
            <strong className="text-white/50">{selectedVehicle.label}</strong> · R${selectedVehicle.pricePerKm.toFixed(2).replace(".", ",")}/km + custo/tempo
          </div>
          <a href={waConfirm} target="_blank" rel="noopener noreferrer">
            <button className="w-full py-3 rounded-xl bg-[#25D366] text-white font-black text-sm hover:bg-[#1da851] transition-all flex items-center justify-center gap-2">
              <Phone className="w-4 h-4" /> Confirmar orçamento pelo WhatsApp
            </button>
          </a>
          <p className="text-white/25 text-xs text-center">*Custo estimado. Pode variar conforme demanda, trânsito e condições da rota. Imagens meramente ilustrativas.</p>
        </div>
      )}
    </div>
  );
}
