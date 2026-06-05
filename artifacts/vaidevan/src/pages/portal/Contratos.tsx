import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { api, ApiContract, ApiContractTemplate, ApiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  FileText, CheckCircle2, Clock, ExternalLink, ShieldCheck,
  Plus, XCircle, User, X, ChevronDown, MapPin, Loader2,
  AlertTriangle, Camera,
} from "lucide-react";
import { useGeolocation, formatCoords, GeoCoords } from "@/hooks/useGeolocation";
import { VistoriaFotosStep, VistoriaData } from "@/components/portal/VistoriaFotosStep";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; Icon: React.ElementType }> = {
    signed:    { label: "Assinado",  cls: "text-green-400 bg-green-400/10",  Icon: CheckCircle2 },
    pending:   { label: "Pendente",  cls: "text-yellow-400 bg-yellow-400/10", Icon: Clock },
    cancelled: { label: "Cancelado", cls: "text-red-400 bg-red-400/10",      Icon: XCircle },
    sent:      { label: "Enviado",   cls: "text-blue-400 bg-blue-400/10",    Icon: ExternalLink },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`flex items-center gap-1.5 text-xs font-bold rounded-full px-3 py-1 ${s.cls}`}>
      <s.Icon className="w-3.5 h-3.5" />{s.label}
    </span>
  );
}

// ─── GeoCapture — captura localização em tempo real ─────────────────────────
function GeoCaptureBadge({ geo, error }: { geo: GeoCoords | null; error?: string | null }) {
  if (error) return (
    <div className="flex items-start gap-2 bg-yellow-400/10 border border-yellow-400/30 rounded-xl px-3 py-2 text-xs text-yellow-300">
      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
      <span>{error}</span>
    </div>
  );
  if (!geo) return null;
  return (
    <div className="flex items-center gap-2 bg-green-400/10 border border-green-400/30 rounded-xl px-3 py-2 text-xs text-green-300">
      <MapPin className="w-3.5 h-3.5 shrink-0" />
      <span className="font-mono">{formatCoords(geo.lat, geo.lng)}</span>
      <span className="text-green-400/60">±{Math.round(geo.accuracy)}m</span>
    </div>
  );
}

// ─── ContractModal ───────────────────────────────────────────────────────────
function ContractModal({ contract, onClose, onSign }: {
  contract: ApiContract; onClose: () => void;
  onSign: (id: number, geo?: GeoCoords) => Promise<void>;
}) {
  const [signing, setSigning] = useState(false);
  const [step, setStep] = useState<"preview" | "geo_capture" | "govbr" | "done">("preview");
  const [signGeo, setSignGeo] = useState<GeoCoords | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const { state: geoState, requestOnce } = useGeolocation();

  const handleRequestGeo = async () => {
    setStep("geo_capture");
    setGeoError(null);
    try {
      const coords = await requestOnce();
      setSignGeo(coords);
      setStep("govbr");
    } catch (err) {
      setGeoError(err instanceof Error ? err.message : "Erro de localização.");
    }
  };

  const handleConfirmSign = async () => {
    setSigning(true);
    try {
      await onSign(contract.id, signGeo ?? undefined);
      setStep("done");
    } finally { setSigning(false); }
  };

  const renderedContent = contract.renderedHtml || `
    <div style="font-family:sans-serif;color:#ccc;padding:8px">
      <p><strong style="color:#fff">LOCADOR:</strong> VaideVan Transportes Ltda., CNPJ XX.XXX.XXX/0001-XX, São Paulo/SP.</p>
      <p><strong style="color:#fff">CONTRATANTE:</strong> ${contract.clientName || "Conforme cadastro"} ${contract.clientCpf ? `— CPF: ${contract.clientCpf}` : ""}.</p>
      <p><strong style="color:#fff">OBJETO:</strong> Contrato de locação de veículo executivo para operação de transporte corporativo.</p>
      <p><strong style="color:#fff">PRAZO:</strong> 24 (vinte e quatro) meses, com renovação automática.</p>
      <p><strong style="color:#fff">REMUNERAÇÃO:</strong> Participação nos resultados conforme Anexo II, pagamentos mensais.</p>
      <p><strong style="color:#fff">GARANTIAS:</strong> Seguro total, manutenção preventiva/corretiva, substituição em 72h.</p>
      <p style="color:#666;font-size:11px;margin-top:12px">O documento completo com todas as cláusulas será disponibilizado após a assinatura digital.</p>
    </div>
  `;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-card border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/10 flex items-start justify-between">
          <div>
            <h2 className="font-black text-white text-xl">{contract.title}</h2>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <p className="text-white/40 text-sm">
                Criado em {new Date(contract.createdAt).toLocaleDateString("pt-BR")}
              </p>
              {contract.clientName && (
                <span className="flex items-center gap-1 text-white/40 text-sm">
                  <User className="w-3.5 h-3.5" />{contract.clientName}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white ml-4"><X className="w-5 h-5" /></button>
        </div>

        {/* ── PREVIEW ── */}
        {step === "preview" && (
          <div className="p-6">
            <div className="bg-background rounded-2xl border border-white/10 p-6 mb-6 min-h-[280px]">
              <div className="border-b border-white/10 pb-4 mb-5">
                <img src="/logo-black-sm.webp" alt="VaideVan" className="h-10 w-auto mb-3" style={{ mixBlendMode: "screen" }} />
                <h3 className="text-white font-black">{contract.title}</h3>
                <p className="text-white/40 text-sm">
                  {contract.type === "locacao" ? "Contrato de Locação"
                    : contract.type === "investimento" ? "Contrato de Investimento"
                    : contract.type === "checklist" ? "Laudo de Vistoria"
                    : "Contrato de Serviços"} — VaideVan
                </p>
              </div>
              <div dangerouslySetInnerHTML={{ __html: renderedContent }} className="text-sm leading-relaxed" />
            </div>

            {contract.clientGovBrVerified && (
              <div className="bg-green-400/5 border border-green-400/20 rounded-xl p-3 mb-4 flex items-center gap-2 text-sm">
                <ShieldCheck className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-green-400 font-semibold">Cliente verificado via Gov.br</span>
              </div>
            )}

            {/* Mostra localização registrada em contratos já assinados */}
            {contract.status === "signed" && contract.signatureGeoLat && contract.signatureGeoLng && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-4 flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <div>
                  <p className="text-white/60 text-xs font-bold uppercase tracking-wide">Localização da assinatura</p>
                  <p className="text-white font-mono text-xs mt-0.5">
                    {formatCoords(contract.signatureGeoLat, contract.signatureGeoLng)}
                    {contract.signatureGeoAccuracy && <span className="text-white/40 ml-2">±{Math.round(contract.signatureGeoAccuracy)}m</span>}
                  </p>
                </div>
              </div>
            )}

            {contract.status === "pending" && (
              <div className="flex flex-col gap-3">
                <Button onClick={handleRequestGeo} className="h-12 font-black rounded-full bg-primary text-black hover:bg-primary/90">
                  <ShieldCheck className="w-4 h-4 mr-2" />Assinar com Gov.br
                </Button>
                <p className="text-white/30 text-xs text-center">
                  Assinatura digital com validade jurídica via Gov.br — Lei 14.063/2020
                </p>
              </div>
            )}
            {contract.status === "signed" && (
              <div className="bg-green-400/10 border border-green-400/30 rounded-2xl p-4 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                <div>
                  <p className="text-green-400 font-bold text-sm">Contrato assinado</p>
                  <p className="text-white/40 text-xs">Protocolo Gov.br: {contract.govBrProtocol}</p>
                  <p className="text-white/40 text-xs">Em {contract.signedAt ? new Date(contract.signedAt).toLocaleString("pt-BR") : ""}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── CAPTURANDO GPS ── */}
        {step === "geo_capture" && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              {geoState.status === "requesting"
                ? <Loader2 className="w-8 h-8 text-primary animate-spin" />
                : <MapPin className="w-8 h-8 text-primary" />}
            </div>
            <h3 className="text-white font-black text-lg mb-2">
              {geoState.status === "requesting" ? "Obtendo localização…" : "Localização"}
            </h3>
            <p className="text-white/50 text-sm mb-6">
              Sua localização em tempo real é obrigatória para a validade jurídica da assinatura.
            </p>
            {geoError && (
              <div className="mb-4">
                <GeoCaptureBadge geo={null} error={geoError} />
                <div className="flex gap-3 mt-4">
                  <Button onClick={() => setStep("preview")} variant="outline" className="flex-1 h-11 rounded-full border-white/20 text-white/70">
                    Voltar
                  </Button>
                  <Button onClick={() => { setSignGeo(null); setStep("govbr"); }} className="flex-1 h-11 font-black rounded-full bg-yellow-500 text-black">
                    Prosseguir sem GPS
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── GOV.BR CONFIRMAÇÃO ── */}
        {step === "govbr" && (
          <div className="p-6">
            <div className="bg-[#1351B4] rounded-2xl p-6 mb-4 text-center">
              <div className="text-5xl mb-3">🏛️</div>
              <h3 className="text-white font-black text-lg mb-1">gov.br</h3>
              <p className="text-white/80 text-sm mb-4">Assinatura Eletrônica com Validade Jurídica</p>
              <div className="bg-white/10 rounded-xl p-4 text-left mb-4">
                <p className="text-white text-sm font-semibold mb-2">Documento a assinar:</p>
                <p className="text-white/80 text-sm">{contract.title}</p>
                <p className="text-white/50 text-xs mt-1">VaideVan Transportes Ltda.</p>
                {contract.clientName && <p className="text-white/50 text-xs">Contratante: {contract.clientName}</p>}
              </div>

              {/* Localização capturada */}
              <div className={`rounded-xl p-3 text-left flex items-center gap-2 ${signGeo ? "bg-green-500/20" : "bg-yellow-500/20"}`}>
                <MapPin className={`w-4 h-4 shrink-0 ${signGeo ? "text-green-300" : "text-yellow-300"}`} />
                <div>
                  <p className={`text-xs font-bold ${signGeo ? "text-green-300" : "text-yellow-300"}`}>
                    {signGeo ? "Localização capturada ✓" : "Sem localização GPS"}
                  </p>
                  {signGeo && (
                    <p className="text-white/70 text-xs font-mono mt-0.5">
                      {formatCoords(signGeo.lat, signGeo.lng)} · ±{Math.round(signGeo.accuracy)}m
                    </p>
                  )}
                </div>
              </div>

              <p className="text-white/50 text-xs mt-3">
                Em produção, você seria redirecionado ao portal Gov.br para autenticação com CPF e verificação biométrica.
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setStep("preview")} variant="outline" className="flex-1 h-11 rounded-full border-white/20 text-white/70">
                Voltar
              </Button>
              <Button onClick={handleConfirmSign} disabled={signing} className="flex-1 h-11 font-black rounded-full bg-primary text-black">
                {signing ? "Assinando…" : "Confirmar Assinatura"}
              </Button>
            </div>
          </div>
        )}

        {/* ── CONCLUÍDO ── */}
        {step === "done" && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-white font-black text-xl mb-2">Contrato Assinado!</h3>
            <p className="text-white/50 text-sm mb-4">Assinatura registrada com sucesso via Gov.br</p>
            {signGeo && (
              <div className="mb-5 inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-white/60 font-mono">{formatCoords(signGeo.lat, signGeo.lng)}</span>
              </div>
            )}
            <Button onClick={onClose} className="h-11 px-8 font-black rounded-full bg-primary text-black">
              Fechar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CreateContractModal ─────────────────────────────────────────────────────
function CreateContractModal({ onClose, onCreated }: {
  onClose: () => void; onCreated: (c: ApiContract) => void;
}) {
  const [templates, setTemplates] = useState<ApiContractTemplate[]>([]);
  const [clients, setClients] = useState<ApiClient[]>([]);
  const [title, setTitle] = useState("");
  const [templateId, setTemplateId] = useState<number | "">("");
  const [clientId, setClientId] = useState<number | "">("");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [selectedTpl, setSelectedTpl] = useState<ApiContractTemplate | null>(null);
  const [step, setStep] = useState<"form" | "vistoria">("form");
  const [vistoriaData, setVistoriaData] = useState<VistoriaData>({
    photos: {}, checklist: {}, obs: "",
  });

  useEffect(() => {
    Promise.all([api.contractTemplates(), api.clients()]).then(([t, c]) => {
      setTemplates(t); setClients(c);
    }).catch(console.error);
  }, []);

  const handleTemplateChange = (id: number | "") => {
    setTemplateId(id);
    const tpl = id ? templates.find(t => t.id === id) || null : null;
    setSelectedTpl(tpl);
    if (tpl && !title) setTitle(tpl.name);
    setFieldValues({});
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError("Título obrigatório"); return; }
    // Checklist: ir para step de vistoria antes de criar
    if (selectedTpl?.type === "checklist") {
      setStep("vistoria");
      return;
    }
    await saveContract();
  };

  const saveContract = async (extraVistoria?: VistoriaData) => {
    setSaving(true); setError("");
    try {
      const vd = extraVistoria ?? vistoriaData;
      const vistoriaPayload = selectedTpl?.type === "checklist" ? {
        checklist: vd.checklist,
        obs: vd.obs,
        photosMeta: Object.entries(vd.photos).flatMap(([section, photos]) =>
          photos.map(p => ({
            section, takenAt: p.takenAt, filename: p.filename,
            lat: p.coords?.lat ?? null, lng: p.coords?.lng ?? null,
            accuracy: p.coords?.accuracy ?? null,
          }))
        ),
      } : undefined;

      const contract = await api.createContract({
        title,
        templateId: templateId || undefined,
        clientId: clientId || undefined,
        filledData: fieldValues,
        vistoriaData: vistoriaPayload,
      });
      onCreated(contract);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar contrato");
    } finally { setSaving(false); }
  };

  const inp = "w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-primary/50 transition-colors";
  const fields: Array<{ key: string; label: string; type: string; required: boolean; placeholder: string }> =
    Array.isArray(selectedTpl?.fields) ? (selectedTpl.fields as any) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-card border border-white/10 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-white/10 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <div>
            <h2 className="font-black text-white text-lg">
              {step === "vistoria" ? "Laudo de Vistoria" : "Novo Contrato"}
            </h2>
            {step === "vistoria" && (
              <p className="text-white/40 text-xs mt-0.5 flex items-center gap-1">
                <Camera className="w-3 h-3" />Fotografe e inspecione o veículo — GPS obrigatório
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {step === "form" && (
          <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
            {error && <p className="text-red-400 text-sm bg-red-400/10 rounded-xl px-4 py-2">{error}</p>}

            <div>
              <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1 block">Modelo de Contrato</label>
              <select className={inp} value={templateId} onChange={e => handleTemplateChange(e.target.value ? Number(e.target.value) : "")}>
                <option value="">Sem modelo (contrato em branco)</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <div>
              <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1 block">Título do Contrato *</label>
              <input className={inp} value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Contrato de Locação — Empresa XYZ" required />
            </div>

            <div>
              <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1 block">Cliente / Contratante</label>
              <select className={inp} value={clientId} onChange={e => setClientId(e.target.value ? Number(e.target.value) : "")}>
                <option value="">Selecionar cliente (opcional)</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name} {c.govBrVerified ? "✓ Gov.br" : ""}</option>)}
              </select>
            </div>

            {fields.length > 0 && (
              <div>
                <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-3">Campos do Modelo</p>
                <div className="space-y-3">
                  {fields.map((field) => (
                    <div key={field.key}>
                      <label className="text-white/40 text-xs mb-1 block">
                        {field.label}{field.required && <span className="text-primary ml-1">*</span>}
                      </label>
                      <input
                        className={inp}
                        type={field.type === "date" ? "date" : field.type === "number" || field.type === "currency" ? "number" : "text"}
                        value={fieldValues[field.key] || ""}
                        onChange={e => setFieldValues(p => ({ ...p, [field.key]: e.target.value }))}
                        placeholder={field.placeholder || field.label}
                        required={field.required}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTpl?.type === "checklist" && (
              <div className="bg-primary/10 border border-primary/30 rounded-xl p-3 flex items-start gap-2 text-xs text-primary">
                <Camera className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  Este modelo exige <strong>registro fotográfico com GPS</strong> de cada parte do veículo.
                  O próximo passo será a vistoria com câmera.
                </span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-11 rounded-full border-white/20 text-white/70">
                Cancelar
              </Button>
              <Button type="submit" disabled={saving} className="flex-1 h-11 font-black rounded-full bg-primary text-black hover:bg-primary/90">
                {saving ? "Criando…" : selectedTpl?.type === "checklist" ? "Próximo: Vistoria →" : "Criar Contrato"}
              </Button>
            </div>
          </form>
        )}

        {step === "vistoria" && (
          <div className="p-6">
            {error && <p className="text-red-400 text-sm bg-red-400/10 rounded-xl px-4 py-2 mb-4">{error}</p>}
            <VistoriaFotosStep
              data={vistoriaData}
              onChange={setVistoriaData}
              onBack={() => setStep("form")}
              onConfirm={() => saveContract(vistoriaData)}
              confirming={saving}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Contratos Page ──────────────────────────────────────────────────────────
export default function Contratos() {
  const [contracts, setContracts] = useState<ApiContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ApiContract | null>(null);
  const [creating, setCreating] = useState(false);

  const load = () => {
    api.contracts().then(setContracts).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSign = async (id: number, geo?: GeoCoords) => {
    const geoPayload = geo ? { geoLat: geo.lat, geoLng: geo.lng, geoAccuracy: geo.accuracy } : undefined;
    const updated = await api.signContract(id, geoPayload);
    setContracts(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
    setSelected(prev => prev?.id === id ? { ...prev, ...updated } : prev);
  };

  const signed = contracts.filter(c => c.status === "signed").length;
  const pending = contracts.filter(c => c.status === "pending").length;

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-white">Contratos</h1>
            <p className="text-white/50 mt-1">Gerencie e assine contratos digitalmente com validação Gov.br</p>
          </div>
          <Button onClick={() => setCreating(true)} className="h-11 px-5 font-black rounded-full bg-primary text-black hover:bg-primary/90 flex-shrink-0">
            <Plus className="w-4 h-4 mr-2" />Novo Contrato
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total",     val: contracts.length, cls: "text-white",        border: "border-white/10" },
            { label: "Pendentes", val: pending,           cls: "text-yellow-400",   border: "border-yellow-400/20" },
            { label: "Assinados", val: signed,            cls: "text-green-400",    border: "border-green-400/20" },
          ].map(s => (
            <div key={s.label} className={`bg-card border ${s.border} rounded-2xl p-5`}>
              <p className="text-white/50 text-sm">{s.label}</p>
              <p className={`text-3xl font-black ${s.cls}`}>{s.val}</p>
            </div>
          ))}
        </div>

        {loading ? (
          [...Array(2)].map((_, i) => <div key={i} className="h-28 bg-card rounded-2xl mb-3 animate-pulse" />)
        ) : contracts.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-bold">Nenhum contrato encontrado</p>
            <p className="text-sm mt-1">Crie o primeiro contrato clicando em "Novo Contrato"</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {contracts.map(c => (
              <div key={c.id} className="bg-card border border-white/10 rounded-2xl p-5 flex items-start justify-between gap-4 hover:border-white/20 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    c.status === "signed" ? "bg-green-400/10" : c.status === "cancelled" ? "bg-red-400/10" : "bg-primary/10"
                  }`}>
                    <FileText className={`w-6 h-6 ${
                      c.status === "signed" ? "text-green-400" : c.status === "cancelled" ? "text-red-400" : "text-primary"
                    }`} />
                  </div>
                  <div>
                    <p className="font-black text-white">{c.title}</p>
                    <div className="flex items-center gap-3 flex-wrap mt-0.5">
                      <p className="text-white/40 text-sm capitalize">
                        {c.type === "locacao" ? "Locação"
                          : c.type === "investimento" ? "Investimento"
                          : c.type === "fretamento" ? "Fretamento"
                          : c.type === "checklist" ? "Vistoria"
                          : "Serviços"}
                      </p>
                      {c.clientName && (
                        <span className="text-white/30 text-xs flex items-center gap-1">
                          <User className="w-3 h-3" />{c.clientName}
                          {c.clientGovBrVerified && <ShieldCheck className="w-3 h-3 text-green-400" />}
                        </span>
                      )}
                      {c.signatureGeoLat && (
                        <span className="text-primary/60 text-xs flex items-center gap-1">
                          <MapPin className="w-3 h-3" />GPS
                        </span>
                      )}
                    </div>
                    {c.govBrProtocol && <p className="text-white/25 text-xs mt-1">Gov.br: {c.govBrProtocol}</p>}
                    <div className="mt-2"><StatusBadge status={c.status} /></div>
                  </div>
                </div>
                <Button
                  onClick={() => setSelected(c)}
                  variant={c.status === "pending" ? "default" : "outline"}
                  className={`flex-shrink-0 rounded-full text-sm font-bold h-9 px-4 ${
                    c.status === "pending"
                      ? "bg-primary text-black hover:bg-primary/90"
                      : "border-white/20 text-white/60 hover:text-white"
                  }`}
                >
                  {c.status === "pending" ? "Assinar" : "Ver"}
                  <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 bg-card border border-white/5 rounded-2xl p-5 flex gap-3">
          <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-white font-semibold text-sm">Assinatura com validade jurídica via Gov.br · Localização em tempo real</p>
            <p className="text-white/40 text-xs mt-1">
              Todos os contratos exigem localização GPS no ato da assinatura. Documentos assinados com MP 2.200-2/2001 e Lei 14.063/2020. Laudos de vistoria incluem registro fotográfico georreferenciado.
            </p>
          </div>
        </div>
      </div>

      {selected && (
        <ContractModal contract={selected} onClose={() => setSelected(null)} onSign={handleSign} />
      )}
      {creating && (
        <CreateContractModal
          onClose={() => setCreating(false)}
          onCreated={c => setContracts(p => [c, ...p])}
        />
      )}
    </DashboardLayout>
  );
}
