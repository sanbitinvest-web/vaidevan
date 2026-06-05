import { useState, useEffect, useRef, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import {
  MapPin, Navigation, Phone, LogOut, Play, Square, Wifi, WifiOff,
  Shield, ChevronRight, CheckCircle2, AlertCircle, ExternalLink, Share2,
} from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const EXTERNAL_API = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "");
const API = EXTERNAL_API ?? `${BASE}/api`;
const DISPATCH_PHONE = "5511999294694";
const GPS_INTERVAL_MS = 30_000;

type DriverInfo = { id: number; name: string; phone: string; trackerUrl: string | null };
type TripInfo = { id: number; vehiclePlate: string | null; vehicleModel: string | null; trackerUrl: string | null; startedAt: string };

type Step = "login" | "trip" | "tracking";

function apiReq<T>(path: string, opts?: RequestInit, token?: string): Promise<T> {
  return fetch(`${API}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts?.headers,
    },
  }).then(async (r) => {
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Erro na requisição");
    return data as T;
  });
}

function formatPhone(p: string) {
  const d = p.replace(/\D/g, "");
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return p;
}

export default function Motorista() {
  const [step, setStep] = useState<Step>("login");
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("vdv_driver_token"));
  const [driver, setDriver] = useState<DriverInfo | null>(null);
  const [activeTrip, setActiveTrip] = useState<TripInfo | null>(null);

  // login form
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // trip form
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [tripTrackerUrl, setTripTrackerUrl] = useState("");
  const [startingTrip, setStartingTrip] = useState(false);

  // tracking
  const [gpsStatus, setGpsStatus] = useState<"idle" | "active" | "denied" | "error">("idle");
  const [lastLocation, setLastLocation] = useState<{ lat: number; lng: number; accuracy: number; timestamp: Date } | null>(null);
  const [pingCount, setPingCount] = useState(0);
  const watchRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Restore session
  useEffect(() => {
    const savedToken = localStorage.getItem("vdv_driver_token");
    if (!savedToken) return;
    apiReq<{ driver: DriverInfo; activeTrip: TripInfo | null }>("/driver/me", {}, savedToken)
      .then(({ driver: d, activeTrip: t }) => {
        setToken(savedToken);
        setDriver(d);
        if (t) {
          setActiveTrip(t);
          setStep("tracking");
          startGps(savedToken, t.id);
        } else {
          setStep("trip");
        }
      })
      .catch(() => {
        localStorage.removeItem("vdv_driver_token");
        setStep("login");
      });
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const data = await apiReq<{ token: string; driver: DriverInfo }>("/driver/login", {
        method: "POST",
        body: JSON.stringify({ phone: phone.replace(/\D/g, ""), pin }),
      });
      localStorage.setItem("vdv_driver_token", data.token);
      setToken(data.token);
      setDriver(data.driver);
      setStep("trip");
    } catch (err: any) {
      setLoginError(err.message || "Credenciais inválidas");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleStartTrip() {
    if (!token) return;
    setStartingTrip(true);
    try {
      const data = await apiReq<{ trip: TripInfo }>("/driver/trip/start", {
        method: "POST",
        body: JSON.stringify({ vehiclePlate: vehiclePlate.toUpperCase() || null, vehicleModel: vehicleModel || null, trackerUrl: tripTrackerUrl || null }),
      }, token);
      setActiveTrip(data.trip);
      setStep("tracking");
      startGps(token, data.trip.id);
    } catch (err: any) {
      alert(err.message || "Erro ao iniciar viagem");
    } finally {
      setStartingTrip(false);
    }
  }

  async function handleEndTrip() {
    if (!token) return;
    if (!confirm("Encerrar a viagem atual?")) return;
    stopGps();
    try {
      await apiReq("/driver/trip/end", { method: "POST" }, token);
    } catch { /* silent */ }
    setActiveTrip(null);
    setLastLocation(null);
    setPingCount(0);
    setGpsStatus("idle");
    setStep("trip");
  }

  function handleLogout() {
    stopGps();
    localStorage.removeItem("vdv_driver_token");
    setToken(null);
    setDriver(null);
    setActiveTrip(null);
    setLastLocation(null);
    setPingCount(0);
    setGpsStatus("idle");
    setStep("login");
  }

  const sendLocationPing = useCallback(async (tk: string, tripId: number, pos: GeolocationPosition) => {
    const { latitude: lat, longitude: lng, accuracy, speed, heading } = pos.coords;
    setLastLocation({ lat, lng, accuracy, timestamp: new Date() });
    setPingCount(c => c + 1);
    try {
      await apiReq("/driver/location", {
        method: "POST",
        body: JSON.stringify({ tripId, lat, lng, accuracy, speed, heading }),
      }, tk);
    } catch { /* silent */ }
  }, []);

  const startGps = useCallback((tk: string, tripId: number) => {
    if (!navigator.geolocation) {
      setGpsStatus("error");
      return;
    }
    setGpsStatus("active");
    navigator.geolocation.getCurrentPosition(
      pos => sendLocationPing(tk, tripId, pos),
      () => setGpsStatus("denied"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        pos => sendLocationPing(tk, tripId, pos),
        () => setGpsStatus("error"),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }, GPS_INTERVAL_MS);
  }, [sendLocationPing]);

  function stopGps() {
    if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    watchRef.current = null;
    intervalRef.current = null;
  }

  useEffect(() => () => stopGps(), []);

  const waText = activeTrip
    ? encodeURIComponent(`Viagem iniciada — ${activeTrip.vehicleModel || "veículo"} ${activeTrip.vehiclePlate || ""}\nMotorista: ${driver?.name}\nIniciada às ${new Date(activeTrip.startedAt).toLocaleTimeString("pt-BR")}`)
    : encodeURIComponent(`Motorista ${driver?.name} disponível. Aguardando instruções.`);

  const waShareUrl = `https://wa.me/${DISPATCH_PHONE}?text=${waText}`;

  const trackerUrl = activeTrip?.trackerUrl || driver?.trackerUrl;

  return (
    <>
      <Helmet>
        <title>Portal do Motorista — VaideVan</title>
        <meta name="robots" content="noindex,nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Helmet>

      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-start px-4 py-6">
        {/* Header */}
        <div className="w-full max-w-sm mb-6 flex items-center justify-between">
          <img src="/logo-black-sm.webp" alt="VaideVan" className="h-8" style={{ mixBlendMode: "screen" }} />
          {driver && (
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm transition-colors">
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          )}
        </div>

        {/* ───── LOGIN ───── */}
        {step === "login" && (
          <div className="w-full max-w-sm">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-black text-white mb-1">Acesso Motorista</h1>
              <p className="text-white/40 text-sm">Entre com seu telefone e PIN</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1.5 block">Telefone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  required
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-primary/60 text-lg font-medium"
                />
              </div>
              <div>
                <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1.5 block">PIN</label>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={pin}
                  onChange={e => setPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••••"
                  required
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-primary/60 text-2xl tracking-[0.5em] text-center font-black"
                />
              </div>

              {loginError && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-primary text-black font-black rounded-xl py-4 text-lg hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loginLoading ? (
                  <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin inline-block" />
                ) : (
                  <><ChevronRight className="w-5 h-5" />Entrar</>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ───── INICIAR VIAGEM ───── */}
        {step === "trip" && driver && (
          <div className="w-full max-w-sm">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black">
                {driver.name[0]}
              </div>
              <div>
                <p className="text-white font-bold">{driver.name}</p>
                <p className="text-white/40 text-sm">{formatPhone(driver.phone)}</p>
              </div>
              <div className="ml-auto">
                <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 rounded-full px-2.5 py-1 font-bold">Online</span>
              </div>
            </div>

            <h2 className="text-xl font-black text-white mb-1">Iniciar Viagem</h2>
            <p className="text-white/40 text-sm mb-6">Informe o veículo e ative o rastreamento GPS</p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1.5 block">Placa do Veículo</label>
                <input
                  type="text"
                  value={vehiclePlate}
                  onChange={e => setVehiclePlate(e.target.value.toUpperCase())}
                  placeholder="ABC-1234"
                  maxLength={8}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-primary/60 font-mono text-lg tracking-wider uppercase"
                />
              </div>
              <div>
                <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1.5 block">Modelo (opcional)</label>
                <input
                  type="text"
                  value={vehicleModel}
                  onChange={e => setVehicleModel(e.target.value)}
                  placeholder="Mercedes Sprinter Executive"
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-primary/60"
                />
              </div>
              <div>
                <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1.5 block">
                  Link do Rastreador (opcional)
                </label>
                <input
                  type="url"
                  value={tripTrackerUrl}
                  onChange={e => setTripTrackerUrl(e.target.value)}
                  placeholder="https://rastreador.gurtam.space/..."
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3.5 text-white placeholder-white/30 focus:outline-none focus:border-primary/60 text-sm"
                />
              </div>
            </div>

            {driver.trackerUrl && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white/60 text-xs mb-0.5">Rastreador do veículo</p>
                  <p className="text-primary text-sm font-bold truncate">{driver.trackerUrl}</p>
                </div>
                <a href={driver.trackerUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}

            <button
              onClick={handleStartTrip}
              disabled={startingTrip}
              className="w-full bg-primary text-black font-black rounded-xl py-4 text-lg hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mb-3"
            >
              {startingTrip
                ? <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin inline-block" />
                : <><Play className="w-5 h-5 fill-black" />Iniciar Viagem & GPS</>}
            </button>

            <a
              href={`https://wa.me/${DISPATCH_PHONE}?text=${encodeURIComponent("Motorista " + driver.name + " está online e disponível.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] font-bold rounded-xl py-3.5 hover:bg-[#25D366]/20 transition-all"
            >
              <Phone className="w-4 h-4" />
              Avisar Central pelo WhatsApp
            </a>
          </div>
        )}

        {/* ───── RASTREAMENTO ATIVO ───── */}
        {step === "tracking" && driver && activeTrip && (
          <div className="w-full max-w-sm">
            {/* Status da viagem */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-400" />
                  </span>
                  <span className="text-green-400 text-sm font-black">Viagem em andamento</span>
                </div>
                <span className="text-white/30 text-xs">#{activeTrip.id}</span>
              </div>
              {activeTrip.vehiclePlate && (
                <div className="text-white font-black text-xl font-mono tracking-widest mb-0.5">{activeTrip.vehiclePlate}</div>
              )}
              {activeTrip.vehicleModel && (
                <div className="text-white/50 text-sm">{activeTrip.vehicleModel}</div>
              )}
              <div className="text-white/30 text-xs mt-2">
                Iniciada às {new Date(activeTrip.startedAt).toLocaleTimeString("pt-BR")}
              </div>
            </div>

            {/* Status GPS */}
            <div className={`rounded-2xl p-4 mb-4 border ${
              gpsStatus === "active"
                ? "bg-green-500/10 border-green-500/30"
                : gpsStatus === "denied"
                ? "bg-red-500/10 border-red-500/30"
                : "bg-white/5 border-white/10"
            }`}>
              <div className="flex items-center gap-3">
                {gpsStatus === "active"
                  ? <Wifi className="w-5 h-5 text-green-400 flex-shrink-0" />
                  : <WifiOff className="w-5 h-5 text-red-400 flex-shrink-0" />}
                <div className="flex-1">
                  <p className={`font-bold text-sm ${gpsStatus === "active" ? "text-green-400" : "text-red-400"}`}>
                    {gpsStatus === "active" ? "GPS Ativo" : gpsStatus === "denied" ? "GPS Bloqueado" : "GPS Aguardando"}
                  </p>
                  {gpsStatus === "denied" && (
                    <p className="text-red-400/60 text-xs mt-0.5">Habilite a localização nas configurações do celular</p>
                  )}
                  {lastLocation && (
                    <p className="text-white/40 text-xs mt-0.5">
                      {lastLocation.lat.toFixed(6)}, {lastLocation.lng.toFixed(6)}
                      {lastLocation.accuracy != null ? ` ±${Math.round(lastLocation.accuracy)}m` : ""}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-white/60 font-black text-lg">{pingCount}</div>
                  <div className="text-white/30 text-xs">pings</div>
                </div>
              </div>
              {lastLocation && (
                <div className="mt-2 pt-2 border-t border-white/10 text-white/30 text-xs">
                  Último ping: {lastLocation.timestamp.toLocaleTimeString("pt-BR")} · próximo em ~30s
                </div>
              )}
            </div>

            {/* Ações WhatsApp */}
            <div className="space-y-3 mb-4">
              <a
                href={waShareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] font-bold rounded-xl px-4 py-3.5 hover:bg-[#25D366]/20 transition-all"
              >
                <Share2 className="w-5 h-5 flex-shrink-0" />
                <div>
                  <div className="font-black text-sm">Compartilhar Localização Live</div>
                  <div className="text-[#25D366]/60 text-xs font-normal">Abre WhatsApp → toque em 📎 → Localização → Compartilhar em tempo real</div>
                </div>
              </a>

              {trackerUrl && (
                <a
                  href={trackerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 bg-primary/10 border border-primary/30 text-primary font-bold rounded-xl px-4 py-3.5 hover:bg-primary/20 transition-all"
                >
                  <Navigation className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <div className="font-black text-sm">Abrir Rastreador do Veículo</div>
                    <div className="text-primary/60 text-xs font-normal truncate">{trackerUrl}</div>
                  </div>
                  <ExternalLink className="w-4 h-4 ml-auto flex-shrink-0" />
                </a>
              )}
            </div>

            {lastLocation && (
              <a
                href={`https://maps.google.com/?q=${lastLocation.lat},${lastLocation.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white/60 font-bold rounded-xl py-3 hover:bg-white/10 transition-all mb-4 text-sm"
              >
                <MapPin className="w-4 h-4" />
                Abrir no Google Maps
              </a>
            )}

            <button
              onClick={handleEndTrip}
              className="w-full flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 font-bold rounded-xl py-4 hover:bg-red-500/20 transition-all"
            >
              <Square className="w-4 h-4 fill-red-400" />
              Encerrar Viagem
            </button>

            <p className="text-center text-white/20 text-xs mt-4">
              Motorista: {driver.name} · {formatPhone(driver.phone)}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
