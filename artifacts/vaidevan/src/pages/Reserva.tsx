import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { useGeolocation, formatCoords } from "@/hooks/useGeolocation";
import { api } from "@/lib/api";
import {
  MapPin, Package,
  ChevronRight, ChevronLeft, CheckCircle2, AlertTriangle, ArrowLeft,
  CreditCard, Smartphone, FileText, DollarSign,
} from "lucide-react";
import BiometricVerify from "@/components/BiometricVerify";

const VEHICLE_TYPES = [
  { value: "sedan_4pax", label: "Sedan Executivo — 4 pessoas", icon: "🚗" },
  { value: "van_6pax", label: "Van Executiva — 6 pessoas", icon: "🚐" },
  { value: "van_8pax", label: "Van Executiva — 8 pessoas", icon: "🚐" },
  { value: "van_10pax", label: "Van Premium — 10 pessoas", icon: "🚐" },
  { value: "micro_15pax", label: "Micro-ônibus — 15 pessoas", icon: "🚍" },
  { value: "micro_19pax", label: "Micro-ônibus — 19 pessoas", icon: "🚍" },
  { value: "onibus_30pax", label: "Ônibus — 30 pessoas", icon: "🚌" },
  { value: "onibus_45pax", label: "Ônibus Executivo — 45 pessoas", icon: "🚌" },
];

const PRIORITY_OPTIONS = [
  { value: "seguranca", label: "Segurança", desc: "Prioridade máxima em motoristas certificados e veículos rastreados", icon: "🛡️" },
  { value: "qualidade", label: "Qualidade", desc: "Veículos premium, conforto e pontualidade", icon: "⭐" },
  { value: "preco", label: "Preço", desc: "Melhor custo-benefício para o trajeto", icon: "💰" },
];

const PAYMENT_METHODS = [
  { value: "pix", label: "PIX", icon: <Smartphone className="w-4 h-4" />, desc: "Transferência imediata, sem taxas" },
  { value: "cartao", label: "Cartão de Crédito", icon: <CreditCard className="w-4 h-4" />, desc: "Taxas e juros por conta do locatário" },
  { value: "boleto", label: "Boleto Bancário", icon: <FileText className="w-4 h-4" />, desc: "Prazo de 2 dias úteis" },
  { value: "transferencia", label: "Transferência", icon: <DollarSign className="w-4 h-4" />, desc: "TED/DOC bancário" },
];

const LUGGAGE_OPTIONS = [
  { value: "sem_bagagem", label: "Sem bagagem" },
  { value: "bagagem_mao", label: "Somente bagagem de mão" },
  { value: "bagagem_pequena", label: "1–2 malas pequenas por pessoa" },
  { value: "bagagem_media", label: "1–2 malas médias por pessoa" },
  { value: "bagagem_grande", label: "Malas grandes / equipamentos" },
  { value: "carga_especial", label: "Carga especial / equipamentos de evento" },
];

type Step = 1 | 2 | 3 | 4;

function StepIndicator({ current, total }: { current: Step; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => i + 1).map(step => (
        <div key={step} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all ${
            step < current ? "bg-primary text-black" :
            step === current ? "bg-primary text-black ring-4 ring-primary/20" :
            "bg-white/10 text-white/40"
          }`}>
            {step < current ? <CheckCircle2 className="w-4 h-4" /> : step}
          </div>
          {step < total && <div className={`h-0.5 w-8 ${step < current ? "bg-primary" : "bg-white/10"}`} />}
        </div>
      ))}
    </div>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-bold text-white/70 mb-1.5">
      {children}{required && <span className="text-primary ml-1">*</span>}
    </label>
  );
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all ${props.className ?? ""}`}
    />
  );
}

function Textarea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all resize-none ${props.className ?? ""}`}
    />
  );
}

export default function Reserva() {
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<number | null>(null);
  const [error, setError] = useState("");

  const { state: geoState, requestOnce } = useGeolocation();
  const geoCoords = geoState.status === "granted" ? geoState.coords : null;

  // Solicita GPS ao montar o componente
  useEffect(() => { requestOnce().catch(() => {}); }, [requestOnce]);

  // Form state
  const [form, setForm] = useState({
    name: "", email: "", phone: "", cpf: "",
    vehicleType: "", passengerCount: "",
    startDate: "", endDate: "", departureTime: "", returnTime: "",
    originAddress: "", destinationAddress: "",
    useAtDestination: false, driveAtDestination: false,
    luggageInfo: "", eventType: "",
    priority: "",
    hasBudget: false, budgetPhotoUrls: [] as string[],
    coastalInfo: "", notes: "",
    paymentMethod: "",
    honeypot: "",
  });

  const set = (field: string, value: unknown) => setForm(f => ({ ...f, [field]: value }));

  const validateStep = (): string | null => {
    if (step === 1) {
      if (!form.name.trim()) return "Informe seu nome completo.";
      if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Informe um e-mail válido.";
      if (!form.phone.trim()) return "Informe seu telefone.";
    }
    if (step === 2) {
      if (!form.vehicleType) return "Selecione o tipo de veículo.";
      if (!form.passengerCount || Number(form.passengerCount) < 1) return "Informe a quantidade de pessoas.";
      if (!form.startDate) return "Informe a data de início.";
      if (!form.endDate) return "Informe a data de término.";
      if (!form.departureTime) return "Informe o horário de saída.";
      if (!form.originAddress.trim()) return "Informe o endereço completo de saída.";
      if (!form.destinationAddress.trim()) return "Informe o endereço completo de destino.";
    }
    if (step === 3) {
      if (!form.priority) return "Selecione sua prioridade principal.";
    }
    return null;
  };

  const next = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError("");
    setStep(s => (s < 4 ? s + 1 : s) as Step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const back = () => {
    setError("");
    setStep(s => (s > 1 ? s - 1 : s) as Step);
  };

  const handleSubmit = async () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    if (!form.paymentMethod) { setError("Selecione a forma de pagamento preferencial."); return; }

    setSubmitting(true);
    setError("");
    try {
      const result = await api.createReservation({
        ...form,
        passengerCount: Number(form.passengerCount),
        geoLat: geoCoords?.lat ?? undefined,
        geoLng: geoCoords?.lng ?? undefined,
        geoAccuracy: geoCoords?.accuracy ?? undefined,
      });
      setSubmitted(result.id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao enviar solicitação. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-black text-white mb-3">Solicitação Recebida!</h1>
          <p className="text-white/60 mb-2">
            Protocolo <span className="text-primary font-bold">#{submitted}</span>
          </p>
          <p className="text-white/50 text-sm mb-8">
            Nossa equipe está de prontidão e entrará em contato imediatamente com o orçamento e a confirmação da sua reserva.
          </p>
          {form.paymentMethod === "cartao" && (
            <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-xl p-4 mb-6 text-left">
              <p className="text-yellow-300 text-sm font-bold flex items-center gap-2 mb-1">
                <CreditCard className="w-4 h-4" />Pagamento via Cartão
              </p>
              <p className="text-yellow-200/70 text-xs">
                Após a confirmação da reserva e definição do valor, você receberá um link de pagamento seguro por e-mail.
                As taxas de cartão de crédito serão incluídas no total.
              </p>
            </div>
          )}
          <div className="flex flex-col gap-3">
            <a
              href={`https://wa.me/5511999294694?text=Ol%C3%A1!%20Fiz%20uma%20reserva%20pelo%20site.%20Protocolo%20%23${submitted}`}
              target="_blank" rel="noopener noreferrer"
              className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <span>📱</span> Confirmar via WhatsApp
            </a>
            <Link href="/" className="text-white/40 hover:text-white text-sm transition-colors">
              ← Voltar ao site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Solicitar Reserva — VaideVan</title>
        <meta name="description" content="Solicite sua reserva de van ou ônibus executivo em São Paulo. Equipe em prontidão — orçamento imediato, sem esperas." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-white/5 px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-white/40 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-white font-black text-lg">Solicitar Reserva</h1>
            <p className="text-white/40 text-xs">VaideVan · Transporte Executivo</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto p-6">
          <StepIndicator current={step} total={4} />

          {/* ── STEP 1: Seus dados ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-black text-white mb-1">Seus dados</h2>
                <p className="text-white/50 text-sm">Para entrarmos em contato com o orçamento</p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <FieldLabel required>Nome completo</FieldLabel>
                  <Input placeholder="Seu nome completo" value={form.name} onChange={e => set("name", e.target.value)} />
                </div>
                <div>
                  <FieldLabel required>E-mail</FieldLabel>
                  <Input type="email" placeholder="seu@email.com" value={form.email} onChange={e => set("email", e.target.value)} />
                </div>
                <div>
                  <FieldLabel required>Telefone / WhatsApp</FieldLabel>
                  <Input placeholder="(11) 99999-9999" value={form.phone} onChange={e => set("phone", e.target.value)} />
                </div>
                <div>
                  <FieldLabel>CPF (opcional)</FieldLabel>
                  <Input placeholder="000.000.000-00" value={form.cpf} onChange={e => set("cpf", e.target.value)} />
                </div>
              </div>

              {/* GPS badge */}
              {geoCoords != null && (
                <div className="flex items-center gap-2 bg-green-400/5 border border-green-400/20 rounded-xl px-3 py-2 text-xs text-green-300">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span>Localização capturada: {formatCoords(geoCoords.lat, geoCoords.lng)} ±{Math.round(geoCoords.accuracy)}m</span>
                </div>
              )}

              {/* Face ID — verificação de identidade */}
              {form.email && (
                <BiometricVerify
                  email={form.email}
                  name={form.name}
                  userType="client"
                  onVerified={() => {}}
                />
              )}

              {/* Honeypot invisível */}
              <input type="text" tabIndex={-1} aria-hidden className="hidden" value={form.honeypot} onChange={e => set("honeypot", e.target.value)} />
            </div>
          )}

          {/* ── STEP 2: Detalhes da viagem ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-black text-white mb-1">Detalhes da viagem</h2>
                <p className="text-white/50 text-sm">Informe os dados do seu trajeto</p>
              </div>

              {/* Tipo de veículo */}
              <div>
                <FieldLabel required>Tipo de veículo desejado</FieldLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {VEHICLE_TYPES.map(v => (
                    <button key={v.value} type="button" onClick={() => set("vehicleType", v.value)}
                      className={`p-4 rounded-xl border text-left transition-all ${form.vehicleType === v.value ? "border-primary bg-primary/10 text-white" : "border-white/10 text-white/60 hover:border-white/20"}`}>
                      <div className="text-2xl mb-1">{v.icon}</div>
                      <div className="text-sm font-bold">{v.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantidade de pessoas */}
              <div>
                <FieldLabel required>Quantidade de pessoas</FieldLabel>
                <Input type="number" min="1" max="200" placeholder="Ex: 6" value={form.passengerCount} onChange={e => set("passengerCount", e.target.value)} />
              </div>

              {/* Datas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel required>Data de saída</FieldLabel>
                  <Input type="date" value={form.startDate} onChange={e => set("startDate", e.target.value)} />
                </div>
                <div>
                  <FieldLabel required>Data de retorno</FieldLabel>
                  <Input type="date" value={form.endDate} onChange={e => set("endDate", e.target.value)} />
                </div>
              </div>

              {/* Horários */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel required>Horário de saída</FieldLabel>
                  <Input type="time" value={form.departureTime} onChange={e => set("departureTime", e.target.value)} />
                </div>
                <div>
                  <FieldLabel>Horário de retorno</FieldLabel>
                  <Input type="time" value={form.returnTime} onChange={e => set("returnTime", e.target.value)} />
                </div>
              </div>

              {/* Endereços */}
              <div>
                <FieldLabel required>Endereço completo de saída</FieldLabel>
                <Textarea rows={2} placeholder="Rua, número, bairro, cidade, CEP" value={form.originAddress} onChange={e => set("originAddress", e.target.value)} />
              </div>
              <div>
                <FieldLabel required>Endereço completo de destino</FieldLabel>
                <Textarea rows={2} placeholder="Rua, número, bairro, cidade, CEP" value={form.destinationAddress} onChange={e => set("destinationAddress", e.target.value)} />
              </div>
            </div>
          )}

          {/* ── STEP 3: Informações adicionais ── */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-black text-white mb-1">Informações adicionais</h2>
                <p className="text-white/50 text-sm">Detalhes para preparar o melhor atendimento</p>
              </div>

              {/* Uso no destino */}
              <div className="space-y-3">
                <div className="bg-card border border-white/10 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-bold text-white text-sm">Haverá uso do veículo no destino?</p>
                      <p className="text-white/40 text-xs mt-0.5">O veículo ficará disponível durante o evento/permanência</p>
                    </div>
                    <button type="button" onClick={() => set("useAtDestination", !form.useAtDestination)}
                      className={`w-12 h-6 rounded-full transition-all shrink-0 ${form.useAtDestination ? "bg-primary" : "bg-white/10"}`}>
                      <div className={`w-5 h-5 bg-white rounded-full transition-all mx-0.5 ${form.useAtDestination ? "translate-x-6" : ""}`} />
                    </button>
                  </div>
                </div>

                <div className="bg-card border border-white/10 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-bold text-white text-sm">O veículo irá circular no destino?</p>
                      <p className="text-white/40 text-xs mt-0.5">O motorista irá fazer trajetos locais no destino</p>
                    </div>
                    <button type="button" onClick={() => set("driveAtDestination", !form.driveAtDestination)}
                      className={`w-12 h-6 rounded-full transition-all shrink-0 ${form.driveAtDestination ? "bg-primary" : "bg-white/10"}`}>
                      <div className={`w-5 h-5 bg-white rounded-full transition-all mx-0.5 ${form.driveAtDestination ? "translate-x-6" : ""}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bagagem */}
              <div>
                <FieldLabel>Quantidade e tamanho de bagagem</FieldLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {LUGGAGE_OPTIONS.map(opt => (
                    <button key={opt.value} type="button" onClick={() => set("luggageInfo", opt.value)}
                      className={`p-3 rounded-xl border text-left text-sm transition-all flex items-center gap-2 ${form.luggageInfo === opt.value ? "border-primary bg-primary/10 text-white font-bold" : "border-white/10 text-white/60 hover:border-white/20"}`}>
                      <Package className={`w-4 h-4 shrink-0 ${form.luggageInfo === opt.value ? "text-primary" : "text-white/30"}`} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tipo de evento */}
              <div>
                <FieldLabel>Tipo de evento / finalidade</FieldLabel>
                <Input placeholder="Ex: Casamento, congresso, excursão, transfer aeroporto..." value={form.eventType} onChange={e => set("eventType", e.target.value)} />
              </div>

              {/* Prioridade */}
              <div>
                <FieldLabel required>Sua expectativa está baseada em:</FieldLabel>
                <div className="space-y-2">
                  {PRIORITY_OPTIONS.map(opt => (
                    <button key={opt.value} type="button" onClick={() => set("priority", opt.value)}
                      className={`w-full p-4 rounded-xl border text-left transition-all ${form.priority === opt.value ? "border-primary bg-primary/10" : "border-white/10 hover:border-white/20"}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{opt.icon}</span>
                        <div>
                          <p className={`font-bold text-sm ${form.priority === opt.value ? "text-white" : "text-white/70"}`}>{opt.label}</p>
                          <p className="text-white/40 text-xs">{opt.desc}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 4: Orçamento e pagamento ── */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-black text-white mb-1">Orçamento e pagamento</h2>
                <p className="text-white/50 text-sm">Últimas informações para concluir sua solicitação</p>
              </div>

              {/* Já possui orçamento? */}
              <div>
                <FieldLabel>Já possui algum orçamento?</FieldLabel>
                <div className="grid grid-cols-2 gap-3">
                  {[{ v: false, l: "Não" }, { v: true, l: "Sim" }].map(opt => (
                    <button key={String(opt.v)} type="button" onClick={() => set("hasBudget", opt.v)}
                      className={`p-4 rounded-xl border font-bold text-sm transition-all ${form.hasBudget === opt.v ? "border-primary bg-primary/10 text-white" : "border-white/10 text-white/60 hover:border-white/20"}`}>
                      {opt.l}
                    </button>
                  ))}
                </div>
                {form.hasBudget && (
                  <p className="text-white/40 text-xs mt-2 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 text-yellow-400 shrink-0" />
                    Envie as fotos/PDF da proposta via WhatsApp após enviar o formulário, citando seu protocolo.
                  </p>
                )}
              </div>

              {/* Destino litoral */}
              <div className="bg-blue-400/5 border border-blue-400/20 rounded-xl p-4">
                <p className="text-blue-300 font-bold text-sm mb-2 flex items-center gap-2">
                  🏖️ Destinos em cidades litorâneas
                </p>
                <p className="text-white/50 text-xs mb-3">
                  Para reservas com destino ao litoral (mesmo fora do Estado), as <strong className="text-white/80">autorizações das prefeituras devem ser providenciadas e informadas pelos Locatários</strong>. As taxas são de responsabilidade do locatário.
                </p>
                <div>
                  <FieldLabel>Número/protocolo da autorização prefeitura (se aplicável)</FieldLabel>
                  <Input placeholder="Ex: Credenciamento prefeitura de Ubatuba nº 1234/2025" value={form.coastalInfo} onChange={e => set("coastalInfo", e.target.value)} />
                </div>
              </div>

              {/* Forma de pagamento */}
              <div>
                <FieldLabel required>Forma de pagamento preferencial</FieldLabel>
                <div className="space-y-2">
                  {PAYMENT_METHODS.map(pm => (
                    <button key={pm.value} type="button" onClick={() => set("paymentMethod", pm.value)}
                      className={`w-full p-4 rounded-xl border text-left transition-all ${form.paymentMethod === pm.value ? "border-primary bg-primary/10" : "border-white/10 hover:border-white/20"}`}>
                      <div className="flex items-center gap-3">
                        <div className={`${form.paymentMethod === pm.value ? "text-primary" : "text-white/40"}`}>{pm.icon}</div>
                        <div>
                          <p className={`font-bold text-sm ${form.paymentMethod === pm.value ? "text-white" : "text-white/70"}`}>{pm.label}</p>
                          <p className="text-white/40 text-xs">{pm.desc}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Observações */}
              <div>
                <FieldLabel>Observações adicionais</FieldLabel>
                <Textarea rows={3} placeholder="Alguma necessidade especial, informação importante para a viagem..." value={form.notes} onChange={e => set("notes", e.target.value)} />
              </div>

              {/* Aviso anti-fraude */}
              <div className="bg-white/5 rounded-xl p-4 text-xs text-white/40 space-y-1">
                <p>🔒 Seus dados são criptografados e utilizados apenas para este atendimento.</p>
                <p>📍 Sua localização pode ser registrada para segurança e confirmação da reserva.</p>
                <p>⚠️ Reservas fraudulentas serão canceladas e comunicadas às autoridades.</p>
              </div>
            </div>
          )}

          {/* Erro */}
          {error && (
            <div className="mt-4 bg-red-400/10 border border-red-400/20 rounded-xl p-3 flex items-center gap-2 text-red-300 text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          {/* Navegação */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button type="button" onClick={back}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 font-bold transition-all">
                <ChevronLeft className="w-4 h-4" />Voltar
              </button>
            )}
            {step < 4 ? (
              <button type="button" onClick={next}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-black font-black py-3 px-6 rounded-xl hover:bg-primary/90 transition-colors">
                Próximo <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 bg-primary text-black font-black py-3 px-6 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60">
                {submitting ? (
                  <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <><CheckCircle2 className="w-5 h-5" />Enviar Solicitação</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
