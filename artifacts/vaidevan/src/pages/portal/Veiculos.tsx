import { useEffect, useState, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { api } from "@/lib/api";
import { Car, MapPin, RefreshCw } from "lucide-react";
import "leaflet/dist/leaflet.css";

type Vehicle = {
  id: number; plate: string; model: string; year: string | null;
  status: string; lat: number; lng: number; lastUpdate: string; operationId: number | null;
};

function simulateMovement(v: Vehicle): Vehicle {
  return {
    ...v,
    lat: v.lat + (Math.random() - 0.5) * 0.003,
    lng: v.lng + (Math.random() - 0.5) * 0.003,
    lastUpdate: new Date().toISOString(),
  };
}

export default function Veiculos() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selected, setSelected] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<any>(null);
  const mapElRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Record<number, any>>({});
  const leafletRef = useRef<any>(null);

  useEffect(() => {
    api.vehicles()
      .then(data => { setVehicles(data); setSelected(data[0] ?? null); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!vehicles.length || !mapElRef.current) return;
    import("leaflet").then(L => {
      leafletRef.current = L;
      if (mapRef.current) {
        mapRef.current.remove();
        markersRef.current = {};
      }
      const center: [number, number] = [vehicles[0].lat, vehicles[0].lng];
      const map = L.map(mapElRef.current!, { zoomControl: true }).setView(center, 13);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      vehicles.forEach(v => {
        const icon = L.divIcon({
          className: "",
          html: `<div style="background:#F5E642;border:2px solid #0a0a0a;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.5)">🚐</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
        const marker = L.marker([v.lat, v.lng], { icon })
          .addTo(map)
          .bindPopup(`<b>${v.plate}</b><br>${v.model} ${v.year ?? ""}<br>Status: ${v.status}`);
        markersRef.current[v.id] = marker;
      });
    });
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, [vehicles.length]);

  useEffect(() => {
    if (!vehicles.length) return;
    const interval = setInterval(() => {
      setVehicles(prev => {
        const updated = prev.map(simulateMovement);
        updated.forEach(v => {
          const marker = markersRef.current[v.id];
          if (marker) marker.setLatLng([v.lat, v.lng]);
        });
        return updated;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [vehicles.length]);

  const focusVehicle = (v: Vehicle) => {
    setSelected(v);
    if (mapRef.current) mapRef.current.flyTo([v.lat, v.lng], 15, { animate: true, duration: 1 });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-screen lg:h-[calc(100vh-0px)]">
        <div className="p-6 pb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-white">Rastreamento em Tempo Real</h1>
              <p className="text-white/50 text-sm mt-0.5">{vehicles.length} veículos monitorados</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/40">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Atualizando...
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row gap-0 min-h-0">
          <div className="lg:w-72 flex-shrink-0 overflow-y-auto bg-card border-r border-white/10 p-3">
            {loading ? (
              [...Array(3)].map((_, i) => <div key={i} className="h-20 bg-background/50 rounded-xl mb-2 animate-pulse" />)
            ) : (
              vehicles.map(v => (
                <button
                  key={v.id}
                  onClick={() => focusVehicle(v)}
                  className={`w-full text-left p-4 rounded-xl mb-2 transition-all border ${
                    selected?.id === v.id
                      ? "bg-primary/10 border-primary/40 text-white"
                      : "bg-background/30 border-white/5 text-white/70 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${v.status === "active" ? "bg-green-400/10" : "bg-red-400/10"}`}>
                      <Car className={`w-4 h-4 ${v.status === "active" ? "text-green-400" : "text-red-400"}`} />
                    </div>
                    <div>
                      <p className="font-black text-sm">{v.plate}</p>
                      <p className="text-xs text-white/40">{v.model}</p>
                    </div>
                    <div className={`ml-auto w-2 h-2 rounded-full ${v.status === "active" ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs text-white/30">
                    <MapPin className="w-3 h-3" />
                    {v.lat.toFixed(4)}, {v.lng.toFixed(4)}
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="flex-1 relative">
            {loading ? (
              <div className="w-full h-full bg-card animate-pulse" />
            ) : (
              <div ref={mapElRef} className="w-full h-full min-h-[400px]" />
            )}
            {selected && (
              <div className="absolute bottom-4 left-4 right-4 lg:right-auto lg:w-72 bg-black/90 backdrop-blur border border-primary/30 rounded-2xl p-4 z-[1000]">
                <p className="font-black text-white">{selected.plate}</p>
                <p className="text-white/60 text-sm">{selected.model} {selected.year ?? ""}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-green-400 text-xs font-semibold">Em movimento</span>
                  <span className="text-white/30 text-xs ml-auto">
                    {new Date(selected.lastUpdate).toLocaleTimeString("pt-BR")}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
