import { useEffect, useRef, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { api, ApiVehicleListing } from "@/lib/api";
import { Car, Plus, Pencil, Trash2, Star, X, Upload, ImagePlus } from "lucide-react";

const VITE_API_URL = import.meta.env.VITE_API_URL ?? "/api";

/* ── Converte qualquer imagem para WebP via Canvas e faz upload ─ */
async function uploadImageAsWebP(file: File, onProgress?: (msg: string) => void): Promise<string> {
  onProgress?.("Convertendo para WebP...");
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  const MAX = 1400;
  const scale = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height));
  canvas.width  = Math.round(bitmap.width  * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const blob: Blob = await new Promise((res, rej) =>
    canvas.toBlob(b => b ? res(b) : rej(new Error("Falha ao converter WebP")), "image/webp", 0.85)
  );

  onProgress?.("Solicitando URL de upload...");
  const { uploadURL, objectPath } = await fetch(`${VITE_API_URL}/storage/uploads/request-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: file.name.replace(/\.[^.]+$/, ".webp"), size: blob.size, contentType: "image/webp" }),
  }).then(r => r.json());

  onProgress?.("Enviando imagem...");
  const put = await fetch(uploadURL, { method: "PUT", body: blob, headers: { "Content-Type": "image/webp" } });
  if (!put.ok) throw new Error("Falha no upload");

  return objectPath as string;   // ex: /objects/abc-123
}

const STATUS_OPTS = [
  { value: "disponivel", label: "Disponível" },
  { value: "reservado",  label: "Reservado" },
  { value: "vendido",    label: "Vendido" },
  { value: "manutencao", label: "Manutenção" },
];

const CONDITION_OPTS = [
  { value: "novo",     label: "Novo (0 km)" },
  { value: "seminovo", label: "Semi-novo" },
  { value: "usado",    label: "Usado" },
];

const FUEL_OPTS = [
  { value: "diesel",   label: "Diesel" },
  { value: "flex",     label: "Flex" },
  { value: "gasolina", label: "Gasolina" },
  { value: "eletrico", label: "Elétrico" },
  { value: "hibrido",  label: "Híbrido" },
];

const ACCESSORIES_SUGG = [
  "Ar-condicionado", "Câmera de ré", "GPS integrado", "Wi-Fi a bordo",
  "Tomadas USB", "Tomadas 110V", "Televisão", "Cortinas", "Poltronas reclináveis",
  "Frigobar", "Rack para bagagens", "Suspensão reforçada", "Vidros elétricos",
  "Alarme", "Rastreador", "Câmera 360°", "Controle de tração",
];

const BENEFITS_SUGG = [
  "Alta liquidez de revenda",
  "Contrato de locação garantido com a VaideVan",
  "Retorno estimado em 18 meses",
  "Manutenção inclusa no contrato",
  "Seguro total incluso no pacote",
  "Valorização anual estimada de 8%",
  "Demanda garantida pela base de clientes VaideVan",
  "Gestão completa pela equipe VaideVan",
];

const emptyForm = () => ({
  brand: "", model: "", year: new Date().getFullYear(), color: "", plate: "",
  fuelType: "diesel", transmission: "manual",
  mileage: 0, passengerCapacity: "", cargoCapacity: "", enginePower: "",
  accessories: [] as string[], benefits: [] as string[],
  photos: [] as string[], coverPhoto: "",
  price: "", priceNegotiable: true,
  expectedReturnMonths: "", monthlyReturn: "", monthlyReturnPercent: "",
  description: "", condition: "usado", location: "São Paulo, SP",
  status: "disponivel", featured: false, sortOrder: 0,
});

type FormState = ReturnType<typeof emptyForm>;

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  disponivel: { label: "Disponível",  cls: "text-green-400  bg-green-400/10" },
  reservado:  { label: "Reservado",   cls: "text-yellow-400 bg-yellow-400/10" },
  vendido:    { label: "Vendido",     cls: "text-red-400    bg-red-400/10" },
  manutencao: { label: "Manutenção",  cls: "text-blue-400   bg-blue-400/10" },
};

function TagInput({ items, onAdd, onRemove, suggestions, placeholder }: {
  items: string[]; onAdd: (v: string) => void; onRemove: (i: number) => void;
  suggestions: string[]; placeholder: string;
}) {
  const [input, setInput] = useState("");
  const add = (v: string) => {
    const t = v.trim();
    if (t && !items.includes(t)) { onAdd(t); setInput(""); }
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-1.5 text-xs bg-white/10 text-white/80 rounded-full px-3 py-1.5">
            {item}
            <button onClick={() => onRemove(i)} className="text-white/40 hover:text-white"><X className="w-3 h-3" /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && (e.preventDefault(), add(input))}
          placeholder={placeholder}
          className="flex-1 bg-background border border-white/10 rounded-xl px-3 py-2 text-white/70 text-sm placeholder-white/20 focus:outline-none focus:border-primary"
        />
        <button
          onClick={() => add(input)}
          className="px-3 py-2 bg-primary/20 border border-primary/30 text-primary rounded-xl text-sm hover:bg-primary/30 transition"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {suggestions.filter(s => !items.includes(s)).slice(0, 8).map((s, i) => (
          <button
            key={i}
            onClick={() => onAdd(s)}
            className="text-xs text-white/30 hover:text-white border border-white/10 hover:border-white/30 rounded-full px-2.5 py-1 transition"
          >
            + {s}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Formata número como BRL (ex: 278000 → "278.000") ── */
function fmtBRL(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("pt-BR");
}
function parseBRL(formatted: string): string {
  return formatted.replace(/\./g, "").replace(/[^\d]/g, "");
}

/* ── Input de moeda brasileiro (texto com pontos de milhar) ── */
function BRLInput({ value, onChange, placeholder = "280000" }: {
  value: string; onChange: (raw: string) => void; placeholder?: string;
}) {
  const display = value ? fmtBRL(value) : "";
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm select-none">R$</span>
      <input
        type="text"
        inputMode="numeric"
        value={display}
        placeholder={placeholder}
        onChange={e => onChange(parseBRL(e.target.value))}
        className="w-full bg-background border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-white/80 text-sm placeholder-white/20 focus:outline-none focus:border-primary"
      />
    </div>
  );
}

/* ── Botão de upload de foto com conversão WebP no browser ── */
function PhotoUploadButton({ onUploaded }: { onUploaded: (path: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"idle" | "uploading">("idle");

  const handleFile = async (file: File) => {
    setState("uploading");
    try {
      const path = await uploadImageAsWebP(file, () => {});
      onUploaded(path);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro no upload");
    } finally {
      setState("idle");
      if (ref.current) ref.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={state === "uploading"}
        className="flex items-center gap-1.5 px-3 py-2 bg-primary/10 border border-primary/30 text-primary rounded-xl text-xs hover:bg-primary/20 transition disabled:opacity-50"
      >
        {state === "uploading" ? <Upload className="w-3.5 h-3.5 animate-bounce" /> : <ImagePlus className="w-3.5 h-3.5" />}
        {state === "uploading" ? "Enviando..." : "Upload Foto (→ WebP)"}
      </button>
    </>
  );
}

function Field({ label, children, note }: { label: string; children: React.ReactNode; note?: string }) {
  return (
    <div>
      <label className="text-white/50 text-xs font-bold uppercase tracking-wider block mb-1.5">{label}</label>
      {children}
      {note && <p className="text-white/25 text-xs mt-1">{note}</p>}
    </div>
  );
}

function Input({ value, onChange, type = "text", placeholder = "" }: {
  value: string | number; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-background border border-white/10 rounded-xl px-3 py-2.5 text-white/80 text-sm placeholder-white/20 focus:outline-none focus:border-primary"
    />
  );
}

function Select({ value, onChange, opts }: { value: string; onChange: (v: string) => void; opts: { value: string; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-background border border-white/10 rounded-xl px-3 py-2.5 text-white/80 text-sm focus:outline-none focus:border-primary"
    >
      {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function VehicleForm({ initial, onSave, onCancel, saving, isEditing }: {
  initial: FormState; onSave: (f: FormState) => void; onCancel: () => void; saving: boolean; isEditing: boolean;
}) {
  const [f, setF] = useState<FormState>(initial);
  const set = (k: keyof FormState) => (v: unknown) => setF(prev => ({ ...prev, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-card border border-white/10 rounded-2xl p-6 space-y-6 w-full max-w-3xl my-8">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-black text-lg">{isEditing ? "Editar Veículo" : "Novo Veículo"}</h3>
        <button onClick={onCancel} className="text-white/30 hover:text-white transition"><X className="w-5 h-5" /></button>
      </div>

      {/* Identificação */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Marca *"><Input value={f.brand} onChange={set("brand")} placeholder="Mercedes-Benz" /></Field>
        <Field label="Modelo *"><Input value={f.model} onChange={set("model")} placeholder="Sprinter Executive" /></Field>
        <Field label="Ano *"><Input value={f.year} onChange={v => set("year")(Number(v))} type="number" placeholder="2022" /></Field>
        <Field label="Cor *"><Input value={f.color} onChange={set("color")} placeholder="Prata" /></Field>
        <Field label="Placa" note="Opcional"><Input value={f.plate} onChange={set("plate")} placeholder="ABC-1234" /></Field>
        <Field label="Localização"><Input value={f.location} onChange={set("location")} placeholder="São Paulo, SP" /></Field>
      </div>

      {/* Técnico */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Field label="Combustível"><Select value={f.fuelType} onChange={set("fuelType")} opts={FUEL_OPTS} /></Field>
        <Field label="Câmbio">
          <Select value={f.transmission} onChange={set("transmission")} opts={[
            { value: "manual", label: "Manual" },
            { value: "automatico", label: "Automático" },
          ]} />
        </Field>
        <Field label="Condição"><Select value={f.condition} onChange={set("condition")} opts={CONDITION_OPTS} /></Field>
        <Field label="Quilometragem (km)"><Input value={f.mileage} onChange={v => set("mileage")(Number(v))} type="number" /></Field>
        <Field label="Passageiros"><Input value={f.passengerCapacity} onChange={set("passengerCapacity")} type="number" placeholder="15" /></Field>
        <Field label="Potência do Motor"><Input value={f.enginePower} onChange={set("enginePower")} placeholder="150 cv" /></Field>
        <Field label="Capacidade de Carga"><Input value={f.cargoCapacity} onChange={set("cargoCapacity")} placeholder="1.5 toneladas" /></Field>
      </div>

      {/* Financeiro */}
      <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 space-y-4">
        <p className="text-primary/70 text-xs font-bold uppercase tracking-wider">Dados de Investimento</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Field label="Preço (R$)" note="Digite apenas números. Ex: 278000">
            <BRLInput value={f.price} onChange={set("price")} placeholder="278000" />
          </Field>
          <Field label="Retorno Mensal (R$)">
            <BRLInput value={f.monthlyReturn} onChange={set("monthlyReturn")} placeholder="4500" />
          </Field>
          <Field label="Retorno (% / mês)"><Input value={f.monthlyReturnPercent} onChange={set("monthlyReturnPercent")} type="number" placeholder="2.5" /></Field>
          <Field label="Prazo retorno (meses)"><Input value={f.expectedReturnMonths} onChange={set("expectedReturnMonths")} type="number" placeholder="18" /></Field>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={f.priceNegotiable} onChange={e => set("priceNegotiable")(e.target.checked)} className="accent-primary" />
          <span className="text-white/60 text-sm">Preço negociável</span>
        </label>
      </div>

      {/* Fotos */}
      <Field label="Fotos do Veículo" note="Faça upload (converte para WebP automaticamente) ou cole a URL da foto.">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <PhotoUploadButton onUploaded={path => set("photos")([...f.photos, path])} />
            <span className="text-white/20 text-xs">ou</span>
          </div>
          <TagInput
            items={f.photos}
            onAdd={v => set("photos")([...f.photos, v])}
            onRemove={i => set("photos")(f.photos.filter((_, idx) => idx !== i))}
            suggestions={[]}
            placeholder="Cole URL da foto (https://...)"
          />
          {f.photos.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {f.photos.map((url, i) => (
                <div key={i} className="relative group w-20 h-14 rounded-lg overflow-hidden border border-white/10">
                  <img
                    src={url.startsWith("/") ? `/api/storage${url}` : url}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={e => (e.currentTarget.style.display = "none")}
                  />
                  <button
                    onClick={() => set("photos")(f.photos.filter((_, idx) => idx !== i))}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
                  >
                    <X className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Field>

      <Field label="Foto de Capa (Principal)">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <PhotoUploadButton onUploaded={path => set("coverPhoto")(path)} />
            <span className="text-white/20 text-xs">ou</span>
          </div>
          <Input value={f.coverPhoto} onChange={set("coverPhoto")} placeholder="URL da foto principal" />
          {f.coverPhoto && (
            <img
              src={f.coverPhoto.startsWith("/") ? `/api/storage${f.coverPhoto}` : f.coverPhoto}
              alt="capa"
              className="w-32 h-20 object-cover rounded-lg border border-white/10 mt-1"
              onError={e => (e.currentTarget.style.display = "none")}
            />
          )}
        </div>
      </Field>

      {/* Acessórios */}
      <Field label="Acessórios e Equipamentos">
        <TagInput
          items={f.accessories}
          onAdd={v => set("accessories")([...f.accessories, v])}
          onRemove={i => set("accessories")(f.accessories.filter((_, idx) => idx !== i))}
          suggestions={ACCESSORIES_SUGG}
          placeholder="Digite um acessório e pressione Enter"
        />
      </Field>

      {/* Benefícios */}
      <Field label="Benefícios para o Investidor">
        <TagInput
          items={f.benefits}
          onAdd={v => set("benefits")([...f.benefits, v])}
          onRemove={i => set("benefits")(f.benefits.filter((_, idx) => idx !== i))}
          suggestions={BENEFITS_SUGG}
          placeholder="Digite um benefício e pressione Enter"
        />
      </Field>

      {/* Descrição */}
      <Field label="Descrição Completa">
        <textarea
          value={f.description}
          onChange={e => set("description")(e.target.value)}
          rows={4}
          placeholder="Descrição detalhada do veículo, histórico de manutenção, diferenciais..."
          className="w-full bg-background border border-white/10 rounded-xl px-3 py-2.5 text-white/70 text-sm placeholder-white/20 focus:outline-none focus:border-primary resize-none"
        />
      </Field>

      {/* Status e destaque */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Status"><Select value={f.status} onChange={set("status")} opts={STATUS_OPTS} /></Field>
        <Field label="Ordem de exibição"><Input value={f.sortOrder} onChange={v => set("sortOrder")(Number(v))} type="number" /></Field>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={f.featured} onChange={e => set("featured")(e.target.checked)} className="accent-primary" />
        <span className="text-white/70 text-sm flex items-center gap-1.5">
          <Star className="w-4 h-4 text-primary" />Marcar como destaque
        </span>
      </label>

      {/* Ações */}
      <div className="flex gap-3 pt-2 border-t border-white/5">
        <button
          onClick={() => onSave(f)}
          disabled={saving || !f.brand || !f.model || !f.year || !f.color}
          className="flex-1 py-3 bg-primary text-black font-black rounded-xl hover:bg-primary/90 transition disabled:opacity-40"
        >
          {saving ? "Salvando..." : "Salvar Veículo"}
        </button>
        <button
          onClick={onCancel}
          className="px-5 py-3 bg-white/5 border border-white/10 text-white/60 rounded-xl hover:bg-white/10 transition"
        >
          Cancelar
        </button>
      </div>
      </div>
    </div>
  );
}

export default function AdminVeiculos() {
  const [listings, setListings] = useState<ApiVehicleListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api.adminVehicleListings().then(setListings).catch(console.error).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openNew = () => { setEditing(null); setForm(emptyForm()); };
  const openEdit = (v: ApiVehicleListing) => {
    setEditing(v.id);
    setForm({
      brand: v.brand, model: v.model, year: v.year, color: v.color, plate: v.plate ?? "",
      fuelType: v.fuelType, transmission: v.transmission,
      mileage: v.mileage, passengerCapacity: String(v.passengerCapacity ?? ""),
      cargoCapacity: v.cargoCapacity ?? "", enginePower: v.enginePower ?? "",
      accessories: v.accessories ?? [], benefits: v.benefits ?? [],
      photos: v.photos ?? [], coverPhoto: v.coverPhoto ?? "",
      price: String(v.price ?? ""), priceNegotiable: v.priceNegotiable,
      expectedReturnMonths: String(v.expectedReturnMonths ?? ""),
      monthlyReturn: String(v.monthlyReturn ?? ""),
      monthlyReturnPercent: String(v.monthlyReturnPercent ?? ""),
      description: v.description ?? "", condition: v.condition, location: v.location ?? "",
      status: v.status, featured: v.featured, sortOrder: v.sortOrder,
    });
  };

  const handleSave = async (f: FormState) => {
    setSaving(true);
    try {
      const payload = {
        ...f,
        year: Number(f.year),
        mileage: Number(f.mileage),
        passengerCapacity: f.passengerCapacity ? Number(f.passengerCapacity) : null,
        price: f.price ? Number(f.price) : null,
        expectedReturnMonths: f.expectedReturnMonths ? Number(f.expectedReturnMonths) : null,
        monthlyReturn: f.monthlyReturn ? Number(f.monthlyReturn) : null,
        monthlyReturnPercent: f.monthlyReturnPercent ? Number(f.monthlyReturnPercent) : null,
        sortOrder: Number(f.sortOrder),
      };
      if (editing) {
        const updated = await api.updateAdminVehicleListing(editing, payload);
        setListings(ls => ls.map(l => l.id === editing ? updated : l));
      } else {
        const created = await api.createAdminVehicleListing(payload);
        setListings(ls => [created, ...ls]);
      }
      setForm(null);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Remover "${name}" do catálogo?`)) return;
    await api.deleteAdminVehicleListing(id);
    setListings(ls => ls.filter(l => l.id !== id));
  };

  const handleStatus = async (id: number, status: string) => {
    const updated = await api.updateAdminVehicleListingStatus(id, status);
    setListings(ls => ls.map(l => l.id === id ? { ...l, status: updated.status } : l));
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-white flex items-center gap-3">
              <Car className="w-7 h-7 text-primary" />
              Catálogo Admin
            </h1>
            <p className="text-white/50 mt-1">Gerencie os veículos exibidos para investidores</p>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-black font-black rounded-xl hover:bg-primary/90 transition text-sm"
          >
            <Plus className="w-4 h-4" />
            Novo Veículo
          </button>
        </div>

        {form && (
          <VehicleForm initial={form} onSave={handleSave} onCancel={() => setForm(null)} saving={saving} isEditing={editing !== null} />
        )}

        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-20 bg-card rounded-2xl mb-3 animate-pulse" />)
        ) : listings.length === 0 && !form ? (
          <div className="text-center py-16 text-white/30">
            <Car className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-lg font-bold">Nenhum veículo no catálogo</p>
            <p className="text-sm mt-1">Clique em "Novo Veículo" para adicionar</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {listings.map(v => {
              const st = STATUS_MAP[v.status] ?? STATUS_MAP.disponivel;
              return (
                <div key={v.id} className="bg-card border border-white/10 rounded-2xl p-5 flex items-center gap-4 hover:border-white/20 transition">
                  <div className="w-16 h-16 rounded-xl bg-white/5 overflow-hidden flex-shrink-0">
                    {v.coverPhoto ? (
                      <img
                        src={v.coverPhoto.startsWith("/") ? `/api/storage${v.coverPhoto}` : v.coverPhoto}
                        alt={v.model}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Car className="w-7 h-7 text-white/20" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-black text-white">{v.brand} {v.model}</p>
                      {v.featured && <Star className="w-3.5 h-3.5 text-primary" />}
                    </div>
                    <p className="text-white/40 text-sm">{v.year} · {v.color} · {v.mileage.toLocaleString("pt-BR")} km</p>
                    {v.price && <p className="text-primary text-sm font-bold">{v.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}</p>}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <select
                      value={v.status}
                      onChange={e => handleStatus(v.id, e.target.value)}
                      className={`text-xs font-bold rounded-full px-3 py-1.5 border-0 outline-none cursor-pointer ${st.cls}`}
                      style={{ background: "transparent" }}
                    >
                      {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <button
                      onClick={() => openEdit(v)}
                      className="p-2 text-white/40 hover:text-primary hover:bg-primary/10 rounded-xl transition"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(v.id, `${v.brand} ${v.model}`)}
                      className="p-2 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
