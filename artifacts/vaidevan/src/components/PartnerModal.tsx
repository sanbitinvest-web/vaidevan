import { useState, useEffect, lazy, Suspense } from "react";
import type { CommercialRef } from "@/components/portal/CommercialRefsForm";
import { useGeolocation, formatCoords } from "@/hooks/useGeolocation";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, CheckCircle2, ChevronRight, FileCheck,
  FileText, Loader2, MapPin, X,
} from "lucide-react";

const BiometricVerify = lazy(() => import("@/components/BiometricVerify"));
const DocumentUploadField = lazy(() => import("@/components/portal/DocumentUploadField").then(m => ({ default: m.DocumentUploadField })));
const SelfieCapture = lazy(() => import("@/components/portal/SelfieCapture").then(m => ({ default: m.SelfieCapture })));
const CommercialRefsForm = lazy(() => import("@/components/portal/CommercialRefsForm").then(m => ({ default: m.CommercialRefsForm })));

const PARTNER_TYPES = [
  { value: "investidor", label: "Investidor" },
  { value: "cliente",    label: "Cliente Corporativo" },
  { value: "revendedor", label: "Revendedor / Agência" },
  { value: "motorista",  label: "Motorista Parceiro" },
];

export default function PartnerModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    type: "investidor", name: "", email: "", phone: "",
    cpf: "", cnpj: "", companyName: "", city: "", state: "", message: "", howFound: "",
  });
  const [docs, setDocs] = useState({ cnhUrl: null as string | null, addressProofUrl: null as string | null });
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const [crlvUrls, setCrlvUrls] = useState<string[]>([]);
  const [contratoSocialUrl, setContratoSocialUrl] = useState<string | null>(null);
  const [commercialRefs, setCommercialRefs] = useState<CommercialRef[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const { state: geoState, requestOnce } = useGeolocation();

  useEffect(() => { requestOnce().catch(() => {}); }, [requestOnce]);

  const needsSelfie = form.type !== "investidor";
  const needsEmpresa = form.type === "parceiro" || form.type === "revendedor";

  const totalSteps = 2 + (needsSelfie ? 1 : 0) + (needsEmpresa ? 1 : 0);
  const stepLabels: string[] = ["Dados", "Documentos"];
  if (needsSelfie) stepLabels.push("Selfie");
  if (needsEmpresa) stepLabels.push("Empresa");

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));
  const inp = "w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-primary/50 transition-colors";

  const canProceedStep = () => {
    if (step === 0) return !!(form.name.trim() && form.email.trim());
    if (step === 1) return !!(docs.cnhUrl && docs.addressProofUrl);
    if (step === 2 && needsSelfie) return !!selfieUrl;
    if ((step === 3 || (step === 2 && !needsSelfie)) && needsEmpresa) {
      return commercialRefs.length === 3 && commercialRefs.every(r => r.name && r.phone && r.email);
    }
    return true;
  };

  const handleNext = () => setStep(s => Math.min(s + 1, totalSteps - 1));
  const handleBack = () => setStep(s => Math.max(s - 1, 0));
  const isLastStep = step === totalSteps - 1;

  const handleSubmit = async () => {
    setStatus("loading"); setErrorMsg("");
    try {
      let coords = geoState.status === "granted" ? geoState.coords : null;
      if (!coords) { try { coords = await requestOnce(); } catch { coords = null; } }
      const { api } = await import("@/lib/api");
      await api.registerPartner({
        type: form.type, name: form.name, email: form.email,
        phone: form.phone || undefined, cpf: form.cpf || undefined,
        cnpj: form.cnpj || undefined, companyName: form.companyName || undefined,
        city: form.city || undefined, state: form.state || undefined,
        message: form.message || undefined, howFound: form.howFound || undefined,
        cnhUrl: docs.cnhUrl || undefined, addressProofUrl: docs.addressProofUrl || undefined,
        selfieUrl: selfieUrl || undefined,
        crlvUrls: crlvUrls.length ? crlvUrls : undefined,
        contratoSocialUrl: contratoSocialUrl || undefined,
        commercialRefs: commercialRefs.length ? commercialRefs : undefined,
        registrationGeoLat: coords?.lat ?? undefined,
        registrationGeoLng: coords?.lng ?? undefined,
        registrationGeoAccuracy: coords?.accuracy ?? undefined,
      });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Erro ao enviar. Tente novamente.");
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-card border border-white/10 rounded-3xl w-full max-w-lg max-h-[92vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-white/10 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <div className="flex items-center gap-3">
            {step > 0 && status !== "success" && (
              <button type="button" onClick={handleBack} className="text-white/30 hover:text-white p-1 -ml-1">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h2 className="font-black text-white text-lg">Seja Nosso Parceiro</h2>
              {status !== "success" && (
                <p className="text-white/40 text-xs mt-0.5">
                  Etapa {step + 1} de {totalSteps} · {stepLabels[step]}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white p-1"><X className="w-5 h-5" /></button>
        </div>

        {/* Progresso */}
        {status !== "success" && (
          <div className="flex gap-1 px-6 pt-4">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? "bg-primary" : "bg-white/10"}`} />
            ))}
          </div>
        )}

        {status === "success" ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-green-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-white font-black text-xl mb-2">Cadastro enviado!</h3>
            <p className="text-white/50 text-sm mb-6">Nossa equipe analisará seus documentos e entrará em contato em até 24 horas.</p>
            <Button onClick={onClose} className="h-11 px-8 font-black rounded-full bg-primary text-black">Fechar</Button>
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {status === "error" && (
              <p className="text-red-400 text-sm bg-red-400/10 rounded-xl px-4 py-2">{errorMsg}</p>
            )}

            {/* ── Etapa 0: Dados básicos ── */}
            {step === 0 && (
              <>
                <div>
                  <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2 block">Tipo de Parceria *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PARTNER_TYPES.map(t => (
                      <button key={t.value} type="button" onClick={() => set("type", t.value)}
                        className={`py-2.5 px-4 rounded-xl text-sm font-bold border transition-all ${
                          form.type === t.value ? "bg-primary text-black border-primary" : "border-white/10 text-white/60 hover:border-white/30 hover:text-white"
                        }`}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1 block">Nome Completo *</label>
                    <input className={inp} value={form.name} onChange={e => set("name", e.target.value)} placeholder="João da Silva" required />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1 block">E-mail *</label>
                    <input className={inp} type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="joao@email.com" required />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1 block">WhatsApp</label>
                    <input className={inp} type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="(11) 99999-0000" />
                  </div>
                  {(form.type === "cliente" || form.type === "revendedor") && (
                    <div className="col-span-2">
                      <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1 block">Empresa / Razão Social</label>
                      <input className={inp} value={form.companyName} onChange={e => set("companyName", e.target.value)} placeholder="Nome da empresa" />
                    </div>
                  )}
                  {form.type !== "motorista" && (
                    <div>
                      <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1 block">
                        {form.type === "cliente" || form.type === "revendedor" ? "CNPJ" : "CPF"}
                      </label>
                      <input className={inp}
                        value={form.type === "cliente" || form.type === "revendedor" ? form.cnpj : form.cpf}
                        onChange={e => set(form.type === "cliente" || form.type === "revendedor" ? "cnpj" : "cpf", e.target.value)}
                        placeholder={form.type === "cliente" || form.type === "revendedor" ? "00.000.000/0001-00" : "000.000.000-00"} />
                    </div>
                  )}
                  <div>
                    <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1 block">Cidade / Estado</label>
                    <input className={inp} value={form.city} onChange={e => set("city", e.target.value)} placeholder="São Paulo / SP" />
                  </div>
                </div>
                <div>
                  <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1 block">Mensagem (opcional)</label>
                  <textarea className={`${inp} resize-none`} rows={3} value={form.message} onChange={e => set("message", e.target.value)} placeholder="Conte um pouco sobre seu interesse…" />
                </div>
                <div>
                  <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1 block">Como nos encontrou?</label>
                  <select className={inp} value={form.howFound} onChange={e => set("howFound", e.target.value)}>
                    <option value="">Selecionar...</option>
                    <option>Google / Pesquisa</option>
                    <option>Indicação de amigo ou parceiro</option>
                    <option>Instagram / Redes Sociais</option>
                    <option>WhatsApp</option>
                    <option>Outro</option>
                  </select>
                </div>
                {form.email && (
                  <Suspense fallback={<div className="h-16 animate-pulse bg-white/5 rounded-xl" />}>
                    <BiometricVerify email={form.email} name={form.name} userType="partner" onVerified={() => {}} />
                  </Suspense>
                )}
              </>
            )}

            {/* ── Etapa 1: Documentos ── */}
            {step === 1 && (
              <Suspense fallback={<div className="space-y-4"><div className="h-24 animate-pulse bg-white/5 rounded-xl" /><div className="h-24 animate-pulse bg-white/5 rounded-xl" /></div>}>
                <>
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex gap-2">
                    <FileCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-white/60 text-xs leading-relaxed">
                      <span className="text-white font-bold">Documentos obrigatórios.</span>{" "}
                      A CNH será conferida nos órgãos do governo para prevenir fraudes. Envie imagens nítidas e legíveis.
                    </p>
                  </div>
                  <DocumentUploadField label="CNH Digital" description="Carteira Nacional de Habilitação (frente e verso ou digital). Será validada automaticamente." accept="image/*,application/pdf" value={docs.cnhUrl} onChange={v => setDocs(d => ({ ...d, cnhUrl: v }))} required allowCamera />
                  <DocumentUploadField label="Comprovante de Endereço" description="Conta de água, luz ou telefone fixo com no máximo 90 dias. Deve estar legível." accept="image/*,application/pdf" value={docs.addressProofUrl} onChange={v => setDocs(d => ({ ...d, addressProofUrl: v }))} required allowCamera />
                </>
              </Suspense>
            )}

            {/* ── Etapa 2: Selfie ── */}
            {step === 2 && needsSelfie && (
              <Suspense fallback={<div className="h-48 animate-pulse bg-white/5 rounded-xl" />}>
                <>
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex gap-2">
                    <FileCheck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-white/60 text-xs leading-relaxed">
                      <span className="text-white font-bold">Prova de vida com documento.</span>{" "}
                      Segure sua CNH ou documento com foto próximo ao rosto. Ambos devem aparecer na imagem.
                    </p>
                  </div>
                  <SelfieCapture value={selfieUrl} onChange={setSelfieUrl} required />
                </>
              </Suspense>
            )}

            {/* ── Etapa empresa ── */}
            {((step === 3 && needsSelfie) || (step === 2 && !needsSelfie)) && needsEmpresa && (
              <>
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex gap-2">
                  <FileText className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-white/60 text-xs leading-relaxed">
                    <span className="text-white font-bold">Documentos da empresa e veículos.</span>{" "}
                    Envie os CRLVs dos veículos a cadastrar, o contrato social e 3 referências comerciais.
                  </p>
                </div>
                <div>
                  <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2 block">CRLV dos Veículos (PDF)</label>
                  <p className="text-white/30 text-xs mb-2">Adicione o CRLV de cada veículo que deseja cadastrar.</p>
                  {crlvUrls.map((url, i) => (
                    <div key={i} className="flex items-center gap-2 mb-2">
                      <div className="flex-1 bg-white/5 border border-green-400/20 rounded-xl px-3 py-2 flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-green-400" />
                        <span className="text-green-300 text-xs">Veículo {i + 1} · CRLV enviado</span>
                      </div>
                      <button type="button" onClick={() => setCrlvUrls(u => u.filter((_, j) => j !== i))} className="text-red-400/40 hover:text-red-400 p-1">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <DocumentUploadField label={`Veículo ${crlvUrls.length + 1}`} description="PDF do CRLV do veículo" accept="application/pdf,image/*" value={null} onChange={v => { if (v) setCrlvUrls(u => [...u, v]); }} allowCamera />
                </div>
                <DocumentUploadField label="Contrato Social" description="Cópia do contrato social ou MEI. PDF ou imagem legível." accept="application/pdf,image/*" value={contratoSocialUrl} onChange={setContratoSocialUrl} allowCamera />
                <Suspense fallback={<div className="h-32 animate-pulse bg-white/5 rounded-xl" />}>
                  <CommercialRefsForm value={commercialRefs} onChange={setCommercialRefs} />
                </Suspense>
              </>
            )}

            {/* GPS indicator */}
            <div className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs border ${
              geoState.status === "granted" ? "bg-green-400/10 border-green-400/20 text-green-300"
              : geoState.status === "denied" ? "bg-yellow-400/10 border-yellow-400/20 text-yellow-300"
              : "bg-white/5 border-white/10 text-white/30"
            }`}>
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              {geoState.status === "granted" && geoState.coords
                ? <span>📍 {formatCoords(geoState.coords.lat, geoState.coords.lng)}</span>
                : geoState.status === "denied" ? <span>Localização negada.</span>
                : <span>Localização será capturada no envio.</span>}
            </div>

            <div className="flex gap-3">
              {step > 0 ? (
                <Button type="button" variant="outline" onClick={handleBack} className="h-11 px-5 rounded-full border-white/20 text-white/70">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              ) : (
                <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-11 rounded-full border-white/20 text-white/70">
                  Cancelar
                </Button>
              )}
              {isLastStep ? (
                <Button type="button" disabled={status === "loading" || !canProceedStep()} onClick={handleSubmit} className="flex-1 h-11 font-black rounded-full bg-primary text-black hover:bg-primary/90">
                  {status === "loading" ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Enviando…</> : "Enviar Cadastro →"}
                </Button>
              ) : (
                <Button type="button" disabled={!canProceedStep()} onClick={handleNext} className="flex-1 h-11 font-black rounded-full bg-primary text-black hover:bg-primary/90 disabled:opacity-40">
                  Próximo <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>

            <p className="text-white/25 text-xs text-center">Seus dados são confidenciais e protegidos.</p>
          </div>
        )}
      </div>
    </div>
  );
}
