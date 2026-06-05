import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { api, ApiVehicleListing } from "@/lib/api";
import {
  Car, Fuel, Gauge, Users, Star, CheckCircle2, TrendingUp,
  Calendar, MapPin, Tag, ChevronLeft, ChevronRight, Phone,
  Wrench, Zap, Info,
} from "lucide-react";

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  disponivel: { label: "Disponível",  cls: "text-green-400  bg-green-400/10  border-green-400/30" },
  reservado:  { label: "Reservado",   cls: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30" },
  vendido:    { label: "Vendido",     cls: "text-red-400    bg-red-400/10    border-red-400/30" },
  manutencao: { label: "Manutenção",  cls: "text-blue-400   bg-blue-400/10   border-blue-400/30" },
};

const CONDITION_MAP: Record<string, string> = {
  novo:      "0 km — Novo",
  seminovo:  "Semi-novo",
  usado:     "Usado",
};

const FUEL_MAP: Record<string, string> = {
  diesel:   "Diesel",
  flex:     "Flex",
  eletrico: "Elétrico",
  hibrido:  "Híbrido",
  gasolina: "Gasolina",
};

function fmt(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function fmtKm(n: number) {
  return n.toLocaleString("pt-BR") + " km";
}

// ── Galeria de fotos ──────────────────────────────────────────────────────────
function PhotoGallery({ photos, cover, model }: { photos: string[]; cover: string | null; model: string }) {
  const all = cover && !photos.includes(cover) ? [cover, ...photos] : photos.length ? photos : cover ? [cover] : [];
  const [idx, setIdx] = useState(0);

  if (!all.length) {
    return (
      <div className="w-full aspect-video bg-white/5 rounded-2xl flex items-center justify-center">
        <Car className="w-16 h-16 text-white/10" />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black">
        <img
          src={all[idx].startsWith("/") ? `/api/storage${all[idx]}` : all[idx]}
          alt={`${model} — foto ${idx + 1}`}
          className="w-full h-full object-cover"
        />
      </div>
      {all.length > 1 && (
        <>
          <button
            onClick={() => setIdx(i => (i - 1 + all.length) % all.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIdx(i => (i + 1) % all.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {all.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`w-2 h-2 rounded-full transition ${i === idx ? "bg-primary" : "bg-white/30"}`}
              />
            ))}
          </div>
          <span className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full font-mono">
            {idx + 1}/{all.length}
          </span>
        </>
      )}
    </div>
  );
}

// ── Card compacto na listagem ─────────────────────────────────────────────────
function VehicleCard({ v, onSelect }: { v: ApiVehicleListing; onSelect: () => void }) {
  const st = STATUS_MAP[v.status] ?? STATUS_MAP.disponivel;
  const thumb = v.coverPhoto
    ? (v.coverPhoto.startsWith("/") ? `/api/storage${v.coverPhoto}` : v.coverPhoto)
    : null;

  return (
    <div
      onClick={onSelect}
      className="bg-card border border-white/10 rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer group relative"
    >
      {v.featured && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-primary text-black text-xs font-black px-2.5 py-1 rounded-full">
          <Star className="w-3 h-3" /> Destaque
        </div>
      )}
      <div className="aspect-video bg-white/5 overflow-hidden">
        {thumb ? (
          <img src={thumb} alt={`${v.brand} ${v.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car className="w-12 h-12 text-white/10" />
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <p className="text-white/40 text-xs font-bold uppercase tracking-wider">{v.brand}</p>
            <h3 className="text-white font-black text-lg leading-tight">{v.model}</h3>
            <p className="text-white/40 text-sm">{v.year} · {v.color}</p>
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${st.cls}`}>
            {st.label}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="flex flex-col items-center bg-white/5 rounded-xl p-2">
            <Gauge className="w-4 h-4 text-white/30 mb-1" />
            <span className="text-white text-xs font-bold">{fmtKm(v.mileage)}</span>
          </div>
          {v.passengerCapacity && (
            <div className="flex flex-col items-center bg-white/5 rounded-xl p-2">
              <Users className="w-4 h-4 text-white/30 mb-1" />
              <span className="text-white text-xs font-bold">{v.passengerCapacity} pax</span>
            </div>
          )}
          <div className="flex flex-col items-center bg-white/5 rounded-xl p-2">
            <Fuel className="w-4 h-4 text-white/30 mb-1" />
            <span className="text-white text-xs font-bold">{FUEL_MAP[v.fuelType] ?? v.fuelType}</span>
          </div>
        </div>

        {v.price && (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/40 text-xs">Valor</p>
              <p className="text-primary font-black text-xl">{fmt(v.price)}</p>
              {v.priceNegotiable && <p className="text-white/30 text-xs">Negociável</p>}
            </div>
            {v.monthlyReturnPercent && (
              <div className="text-right">
                <p className="text-white/40 text-xs">Retorno est.</p>
                <p className="text-green-400 font-black text-lg">
                  {v.monthlyReturnPercent.toFixed(1)}%/mês
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Modal de detalhe ──────────────────────────────────────────────────────────
function VehicleModal({ v, onClose }: { v: ApiVehicleListing; onClose: () => void }) {
  const st = STATUS_MAP[v.status] ?? STATUS_MAP.disponivel;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 lg:p-8 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-3xl bg-card border border-white/10 rounded-3xl overflow-hidden my-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
          <div>
            <p className="text-white/40 text-xs font-bold uppercase tracking-wider">{v.brand}</p>
            <h2 className="text-2xl font-black text-white">{v.model}</h2>
            <p className="text-white/50 text-sm mt-0.5">
              {v.year} · {v.color} · {CONDITION_MAP[v.condition] ?? v.condition}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {v.featured && (
              <span className="flex items-center gap-1 bg-primary text-black text-xs font-black px-3 py-1.5 rounded-full">
                <Star className="w-3.5 h-3.5" />Destaque
              </span>
            )}
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${st.cls}`}>{st.label}</span>
            <button onClick={onClose} className="text-white/40 hover:text-white text-2xl leading-none transition">×</button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Galeria */}
          <PhotoGallery photos={v.photos ?? []} cover={v.coverPhoto} model={v.model} />

          {/* Dados técnicos */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Gauge,    label: "Quilometragem", value: fmtKm(v.mileage) },
              { icon: Fuel,     label: "Combustível",   value: FUEL_MAP[v.fuelType] ?? v.fuelType },
              { icon: Car,      label: "Câmbio",        value: v.transmission === "automatico" ? "Automático" : "Manual" },
              ...(v.passengerCapacity ? [{ icon: Users,  label: "Passageiros", value: `${v.passengerCapacity} pessoas` }] : []),
              ...(v.enginePower      ? [{ icon: Zap,    label: "Motor",        value: v.enginePower }] : []),
              ...(v.cargoCapacity    ? [{ icon: Car,    label: "Carga",        value: v.cargoCapacity }] : []),
              ...(v.location         ? [{ icon: MapPin, label: "Localização",  value: v.location }] : []),
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-white/5 rounded-xl p-3 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-white/40">
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
                </div>
                <p className="text-white text-sm font-bold">{value}</p>
              </div>
            ))}
          </div>

          {/* Preço e retorno */}
          {v.price && (
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
              <p className="text-primary/60 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                <Tag className="w-3.5 h-3.5" />Investimento
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-white/40 text-xs mb-1">Valor de venda</p>
                  <p className="text-primary font-black text-2xl">{fmt(v.price)}</p>
                  {v.priceNegotiable && <p className="text-white/30 text-xs mt-0.5">Valor negociável</p>}
                </div>
                {v.monthlyReturn && (
                  <div>
                    <p className="text-white/40 text-xs mb-1">Retorno mensal est.</p>
                    <p className="text-green-400 font-black text-2xl">{fmt(v.monthlyReturn)}</p>
                    {v.monthlyReturnPercent && (
                      <p className="text-green-400/60 text-xs mt-0.5">{v.monthlyReturnPercent.toFixed(1)}% ao mês</p>
                    )}
                  </div>
                )}
                {v.expectedReturnMonths && (
                  <div>
                    <p className="text-white/40 text-xs mb-1">Prazo de retorno</p>
                    <p className="text-white font-black text-2xl">{v.expectedReturnMonths} meses</p>
                    <p className="text-white/30 text-xs mt-0.5">estimado</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Acessórios */}
          {v.accessories && v.accessories.length > 0 && (
            <div>
              <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                <Wrench className="w-3.5 h-3.5" />Acessórios e Equipamentos
              </p>
              <div className="flex flex-wrap gap-2">
                {v.accessories.map((acc, i) => (
                  <span key={i} className="flex items-center gap-1.5 text-sm text-white/70 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary/70" />
                    {acc}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Benefícios para o investidor */}
          {v.benefits && v.benefits.length > 0 && (
            <div className="bg-green-400/5 border border-green-400/15 rounded-2xl p-5">
              <p className="text-green-400/70 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5" />Benefícios para o Investidor
              </p>
              <div className="space-y-2">
                {v.benefits.map((b, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-green-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-green-400" />
                    </div>
                    <span className="text-white/80 text-sm">{b}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Descrição */}
          {v.description && (
            <div>
              <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                <Info className="w-3.5 h-3.5" />Descrição
              </p>
              <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">{v.description}</p>
            </div>
          )}

          {/* CTA */}
          {v.status === "disponivel" && (
            <div className="bg-primary/10 border border-primary/30 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-white font-bold">Interessado neste veículo?</p>
                <p className="text-white/50 text-sm">Entre em contato com a equipe VaideVan para negociação e documentação.</p>
              </div>
              <a
                href={`https://wa.me/5511999294694?text=Ol%C3%A1%2C+tenho+interesse+no+ve%C3%ADculo+${encodeURIComponent(v.brand + " " + v.model + " " + v.year)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-5 py-3 rounded-xl font-bold text-sm transition-colors flex-shrink-0"
              >
                <Phone className="w-4 h-4" />
                Falar pelo WhatsApp
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function CatalogoVeiculos() {
  const [listings, setListings] = useState<ApiVehicleListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("todos");
  const [selected, setSelected] = useState<ApiVehicleListing | null>(null);

  useEffect(() => {
    api.vehicleListings()
      .then(setListings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "todos" ? listings : listings.filter(v => v.status === filter);

  const counts = {
    todos:      listings.length,
    disponivel: listings.filter(v => v.status === "disponivel").length,
    reservado:  listings.filter(v => v.status === "reservado").length,
    vendido:    listings.filter(v => v.status === "vendido").length,
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-black text-white flex items-center gap-3">
            <Car className="w-7 h-7 text-primary" />
            Catálogo de Veículos
          </h1>
          <p className="text-white/50 mt-1">
            Veículos disponíveis para compra e investimento — acesso exclusivo para investidores aprovados
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 mb-6">
          {[
            { key: "todos",      label: "Todos",       count: counts.todos,      cls: "text-white",       border: "border-white/10" },
            { key: "disponivel", label: "Disponíveis", count: counts.disponivel, cls: "text-green-400",   border: "border-green-400/20" },
            { key: "reservado",  label: "Reservados",  count: counts.reservado,  cls: "text-yellow-400",  border: "border-yellow-400/20" },
            { key: "vendido",    label: "Vendidos",    count: counts.vendido,    cls: "text-red-400",     border: "border-red-400/20" },
          ].map(s => (
            <button
              key={s.key}
              onClick={() => setFilter(s.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold transition-all ${s.border} ${s.cls} ${filter === s.key ? "bg-white/10" : "opacity-60 hover:opacity-100"}`}
            >
              {s.label}
              <span className="bg-white/10 px-1.5 py-0.5 rounded-full text-xs">{s.count}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl animate-pulse">
                <div className="aspect-video bg-white/5 rounded-t-2xl" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-white/5 rounded-full w-3/4" />
                  <div className="h-3 bg-white/5 rounded-full w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <Car className="w-14 h-14 mx-auto mb-4 opacity-20" />
            <p className="text-xl font-bold">
              {filter === "todos" ? "Nenhum veículo cadastrado ainda" : `Nenhum veículo ${filter}`}
            </p>
            <p className="text-sm mt-2">
              {filter === "todos"
                ? "A equipe VaideVan adicionará veículos disponíveis em breve"
                : "Altere o filtro para ver outros veículos"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(v => (
              <VehicleCard key={v.id} v={v} onSelect={() => setSelected(v)} />
            ))}
          </div>
        )}
      </div>

      {selected && <VehicleModal v={selected} onClose={() => setSelected(null)} />}
    </DashboardLayout>
  );
}
