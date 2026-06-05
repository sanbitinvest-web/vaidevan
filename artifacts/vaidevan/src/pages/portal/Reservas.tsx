import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { api, ApiReservation } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Calendar, Users, MapPin, CreditCard, Clock, CheckCircle2,
  XCircle, AlertCircle, Trash2, ChevronDown, DollarSign,
  ExternalLink, QrCode, Car, Copy, Check,
} from "lucide-react";

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  novo:       { label: "Novo",        cls: "text-blue-400 bg-blue-400/10" },
  em_analise: { label: "Em Análise",  cls: "text-yellow-400 bg-yellow-400/10" },
  aprovado:   { label: "Aprovado",    cls: "text-green-400 bg-green-400/10" },
  recusado:   { label: "Recusado",    cls: "text-red-400 bg-red-400/10" },
  cancelado:  { label: "Cancelado",   cls: "text-white/30 bg-white/5" },
};

const PAYMENT_STATUS: Record<string, { label: string; cls: string }> = {
  pendente: { label: "Pendente", cls: "text-yellow-400" },
  pago:     { label: "Pago",     cls: "text-green-400" },
  cancelado:{ label: "Cancelado",cls: "text-red-400" },
};

const VEHICLE_LABELS: Record<string, string> = {
  van_executiva: "Van Executiva",
  van_premium: "Van Premium",
  micro_onibus: "Micro-ônibus",
  onibus: "Ônibus",
};

const PRIORITY_LABELS: Record<string, string> = {
  seguranca: "🛡️ Segurança",
  qualidade: "⭐ Qualidade",
  preco: "💰 Preço",
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button onClick={copy} className="text-white/30 hover:text-primary transition-colors p-1">
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function ReservationCard({
  r, onUpdate, onDelete, onGenerateLink
}: {
  r: ApiReservation;
  onUpdate: (id: number, data: Partial<ApiReservation>) => Promise<void>;
  onDelete: (id: number) => void;
  onGenerateLink: (id: number, gateway: "stripe" | "mercadopago" | "infinitepay") => Promise<string>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [editAmount, setEditAmount] = useState(String(r.paymentAmount ?? ""));
  const [editNotes, setEditNotes] = useState(r.adminNotes ?? "");
  const [linkLoading, setLinkLoading] = useState<"stripe" | "mp" | "ip" | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<{ stripe?: string; mp?: string; ip?: string }>({
    stripe: r.stripeCheckoutUrl ?? undefined,
    mp: r.mpCheckoutUrl ?? undefined,
    ip: r.ipayCheckoutUrl ?? undefined,
  });
  const [linkError, setLinkError] = useState("");

  const handleSave = async () => {
    setBusy(true);
    try {
      await onUpdate(r.id, {
        paymentAmount: editAmount ? Number(editAmount) : undefined,
        adminNotes: editNotes,
      });
    } finally { setBusy(false); }
  };

  const handleStatus = async (status: string) => {
    setBusy(true);
    try { await onUpdate(r.id, { status }); }
    finally { setBusy(false); }
  };

  const handleGenLink = async (gateway: "stripe" | "mercadopago" | "infinitepay") => {
    const key: "stripe" | "mp" | "ip" = gateway === "stripe" ? "stripe" : gateway === "mercadopago" ? "mp" : "ip";
    setLinkLoading(key);
    setLinkError("");
    try {
      const url = await onGenerateLink(r.id, gateway);
      setGeneratedUrl(prev => ({ ...prev, [key]: url }));
    } catch (e) {
      setLinkError(e instanceof Error ? e.message : "Erro ao gerar link.");
    } finally {
      setLinkLoading(null);
    }
  };

  const ps = PAYMENT_STATUS[r.paymentStatus] ?? PAYMENT_STATUS.pendente;
  const ss = STATUS_MAP[r.status] ?? STATUS_MAP.novo;
  const canGenerate = (r.paymentAmount ?? 0) > 0;

  const payLink = `${window.location.origin}/reserva/${r.id}/pagar`;

  return (
    <div className="bg-card border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-colors">
      {/* Cabeçalho */}
      <div className="p-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Car className="w-6 h-6 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-black text-white">{r.name}</p>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ss.cls}`}>{ss.label}</span>
              <span className={`text-xs font-bold ${ps.cls}`}>{ps.label}</span>
              {r.paymentAmount && (
                <span className="text-xs font-black text-primary">
                  {r.paymentAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
              )}
            </div>
            <p className="text-white/50 text-sm mt-0.5 truncate">{r.email} · {r.phone}</p>
            <div className="flex items-center gap-4 mt-1 text-xs text-white/40 flex-wrap">
              <span className="flex items-center gap-1"><Car className="w-3 h-3" />{VEHICLE_LABELS[r.vehicleType] ?? r.vehicleType}</span>
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{r.passengerCount} pax</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{r.startDate} → {r.endDate}</span>
              {r.paymentMethod && (
                <span className="flex items-center gap-1">
                  {r.paymentMethod === "mercadopago" ? <CreditCard className="w-3 h-3" /> : r.paymentMethod === "infinitepay" ? <QrCode className="w-3 h-3" /> : <DollarSign className="w-3 h-3" />}
                  {r.paymentMethod}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-white/30 text-xs">#{r.id}</span>
          <button onClick={() => setExpanded(x => !x)}
            className={`p-2 rounded-lg border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-all ${expanded ? "rotate-180" : ""}`}>
            <ChevronDown className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(r.id)} className="p-2 rounded-lg border border-white/10 text-red-400/40 hover:text-red-400 hover:border-red-400/20 transition-all">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-white/5 p-5 space-y-4">
          {/* Endereços */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-background/60 rounded-xl p-3">
              <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-1">Saída</p>
              <p className="text-white/80 text-sm">{r.originAddress}</p>
              <p className="text-white/40 text-xs mt-1">{r.departureTime}{r.returnTime ? ` → ${r.returnTime}` : ""}</p>
            </div>
            <div className="bg-background/60 rounded-xl p-3">
              <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-1">Destino</p>
              <p className="text-white/80 text-sm">{r.destinationAddress}</p>
            </div>
          </div>

          {/* Detalhes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="bg-background/60 rounded-xl p-3">
              <p className="text-white/40 uppercase tracking-wider mb-1">Uso no destino</p>
              <p className={r.useAtDestination ? "text-green-400 font-bold" : "text-white/60"}>{r.useAtDestination ? "Sim" : "Não"}</p>
            </div>
            <div className="bg-background/60 rounded-xl p-3">
              <p className="text-white/40 uppercase tracking-wider mb-1">Circula no destino</p>
              <p className={r.driveAtDestination ? "text-green-400 font-bold" : "text-white/60"}>{r.driveAtDestination ? "Sim" : "Não"}</p>
            </div>
            <div className="bg-background/60 rounded-xl p-3">
              <p className="text-white/40 uppercase tracking-wider mb-1">Prioridade</p>
              <p className="text-white/80 font-bold">{PRIORITY_LABELS[r.priority] ?? r.priority}</p>
            </div>
            {r.luggageInfo && (
              <div className="bg-background/60 rounded-xl p-3">
                <p className="text-white/40 uppercase tracking-wider mb-1">Bagagem</p>
                <p className="text-white/80">{r.luggageInfo}</p>
              </div>
            )}
            {r.eventType && (
              <div className="bg-background/60 rounded-xl p-3">
                <p className="text-white/40 uppercase tracking-wider mb-1">Evento</p>
                <p className="text-white/80">{r.eventType}</p>
              </div>
            )}
            <div className="bg-background/60 rounded-xl p-3">
              <p className="text-white/40 uppercase tracking-wider mb-1">Possui orçamento</p>
              <p className={r.hasBudget ? "text-yellow-400 font-bold" : "text-white/60"}>{r.hasBudget ? "Sim" : "Não"}</p>
            </div>
          </div>

          {r.coastalInfo && (
            <div className="bg-blue-400/5 border border-blue-400/20 rounded-xl p-3 text-sm">
              <p className="text-blue-300 font-bold text-xs mb-1">🏖️ Autorização Litoral</p>
              <p className="text-white/70">{r.coastalInfo}</p>
            </div>
          )}

          {r.notes && (
            <div className="bg-background/60 rounded-xl p-3">
              <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-1">Observações</p>
              <p className="text-white/70 text-sm">{r.notes}</p>
            </div>
          )}

          {/* GPS */}
          {r.geoLat != null && r.geoLng != null && (
            <div className="flex items-center gap-2 bg-green-400/5 border border-green-400/20 rounded-xl px-3 py-2">
              <MapPin className="w-3.5 h-3.5 text-green-400 shrink-0" />
              <div>
                <p className="text-green-300 text-xs font-bold">📍 Localização de solicitação</p>
                <p className="text-green-200/60 text-xs font-mono">{r.geoLat.toFixed(6)}, {r.geoLng.toFixed(6)}</p>
              </div>
              <a href={`https://maps.google.com/?q=${r.geoLat},${r.geoLng}`} target="_blank" rel="noopener noreferrer"
                className="ml-auto text-green-400/60 hover:text-green-400 transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Admin: valor e notas */}
          <div className="border-t border-white/5 pt-4 space-y-3">
            <p className="text-white/40 text-xs font-bold uppercase tracking-wider">Administração</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-white/50 text-xs block mb-1">Valor da reserva (R$)</label>
                <input type="number" min="0" step="0.01" placeholder="0,00"
                  value={editAmount} onChange={e => setEditAmount(e.target.value)}
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary/60 transition-all" />
              </div>
              <div>
                <label className="text-white/50 text-xs block mb-1">Notas internas</label>
                <input type="text" placeholder="Observações do admin..."
                  value={editNotes} onChange={e => setEditNotes(e.target.value)}
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary/60 transition-all" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={handleSave} disabled={busy}>
                {busy ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>

          {/* Link do cliente para pagamento */}
          <div className="border-t border-white/5 pt-4 space-y-3">
            <p className="text-white/40 text-xs font-bold uppercase tracking-wider">Link de Pagamento para o Cliente</p>

            {/* Link da página de pagamento */}
            <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-xl px-3 py-2">
              <p className="text-primary/80 text-xs font-mono flex-1 truncate">{payLink}</p>
              <CopyButton text={payLink} />
              <a href={payLink} target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-primary transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <p className="text-white/30 text-xs">Envie este link ao cliente. Ele escolherá o gateway e será redirecionado para pagar.</p>

            {/* Gerar links diretos por gateway */}
            {canGenerate && r.paymentStatus !== "pago" && (
              <div className="space-y-2">
                <p className="text-white/40 text-xs font-bold uppercase tracking-wider">Gerar Link Direto (aprovado + link instantâneo)</p>

                {linkError && (
                  <p className="text-red-400 text-xs bg-red-400/10 rounded-lg px-3 py-2">{linkError}</p>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => handleGenLink("stripe")} disabled={linkLoading !== null}
                    className="bg-[#635BFF] hover:bg-[#4f48e2] text-white text-xs h-8 px-3">
                    {linkLoading === "stripe" ? (
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" /> Gerando...</span>
                    ) : (
                      <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> Stripe</span>
                    )}
                  </Button>
                  <Button size="sm" onClick={() => handleGenLink("mercadopago")} disabled={linkLoading !== null}
                    className="bg-[#009EE3] hover:bg-[#0086c1] text-white text-xs h-8 px-3">
                    {linkLoading === "mp" ? (
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" /> Gerando...</span>
                    ) : (
                      <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> Mercado Pago</span>
                    )}
                  </Button>
                  <Button size="sm" onClick={() => handleGenLink("infinitepay")} disabled={linkLoading !== null}
                    className="bg-[#6C1ED6] hover:bg-[#5a19b3] text-white text-xs h-8 px-3">
                    {linkLoading === "ip" ? (
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" /> Gerando...</span>
                    ) : (
                      <span className="flex items-center gap-1.5"><QrCode className="w-3.5 h-3.5" /> InfinityPay</span>
                    )}
                  </Button>
                </div>

                {(generatedUrl.stripe || generatedUrl.mp || generatedUrl.ip) && (
                  <div className="space-y-1.5 mt-2">
                    {generatedUrl.stripe && (
                      <div className="flex items-center gap-2 bg-[#635BFF]/10 border border-[#635BFF]/30 rounded-lg px-3 py-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-[#635BFF] shrink-0" />
                        <p className="text-[#635BFF] text-xs font-mono flex-1 truncate">{generatedUrl.stripe}</p>
                        <CopyButton text={generatedUrl.stripe} />
                        <a href={generatedUrl.stripe} target="_blank" rel="noopener noreferrer" className="text-[#635BFF]/60 hover:text-[#635BFF]">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                    {generatedUrl.mp && (
                      <div className="flex items-center gap-2 bg-[#009EE3]/10 border border-[#009EE3]/30 rounded-lg px-3 py-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-[#009EE3] shrink-0" />
                        <p className="text-[#009EE3] text-xs font-mono flex-1 truncate">{generatedUrl.mp}</p>
                        <CopyButton text={generatedUrl.mp} />
                        <a href={generatedUrl.mp} target="_blank" rel="noopener noreferrer" className="text-[#009EE3]/60 hover:text-[#009EE3]">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                    {generatedUrl.ip && (
                      <div className="flex items-center gap-2 bg-[#6C1ED6]/10 border border-[#6C1ED6]/30 rounded-lg px-3 py-1.5">
                        <QrCode className="w-3.5 h-3.5 text-[#6C1ED6] shrink-0" />
                        <p className="text-[#6C1ED6] text-xs font-mono flex-1 truncate">{generatedUrl.ip}</p>
                        <CopyButton text={generatedUrl.ip} />
                        <a href={generatedUrl.ip} target="_blank" rel="noopener noreferrer" className="text-[#6C1ED6]/60 hover:text-[#6C1ED6]">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2">Atualizar status</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(STATUS_MAP).map(([key, { label, cls }]) => (
                <button key={key} onClick={() => handleStatus(key)} disabled={busy || r.status === key}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-all disabled:opacity-40 ${
                    r.status === key ? `${cls} border-transparent` : "border-white/10 text-white/50 hover:border-white/30 hover:text-white"
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Reservas() {
  const [reservations, setReservations] = useState<ApiReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("todos");

  const load = () => {
    setLoading(true);
    api.reservations().then(setReservations).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleUpdate = async (id: number, data: Partial<ApiReservation>) => {
    const updated = await api.updateReservation(id, data);
    setReservations(rs => rs.map(r => r.id === id ? { ...r, ...updated } : r));
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remover esta reserva?")) return;
    await api.deleteReservation(id);
    setReservations(rs => rs.filter(r => r.id !== id));
  };

  const handleGenerateLink = async (id: number, gateway: "stripe" | "mercadopago" | "infinitepay"): Promise<string> => {
    const result = await api.generateAdminPaymentLink(id, gateway);
    setReservations(rs => rs.map(r => r.id === id ? {
      ...r,
      status: "aprovado",
      paymentMethod: gateway,
      stripeCheckoutUrl: gateway === "stripe" ? result.checkoutUrl : r.stripeCheckoutUrl,
      mpCheckoutUrl: gateway === "mercadopago" ? result.checkoutUrl : r.mpCheckoutUrl,
      ipayCheckoutUrl: gateway === "infinitepay" ? result.checkoutUrl : r.ipayCheckoutUrl,
    } : r));
    return result.checkoutUrl;
  };

  const filtered = filter === "todos" ? reservations : reservations.filter(r => r.status === filter);

  const counts = {
    todos: reservations.length,
    novo: reservations.filter(r => r.status === "novo").length,
    em_analise: reservations.filter(r => r.status === "em_analise").length,
    aprovado: reservations.filter(r => r.status === "aprovado").length,
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-black text-white flex items-center gap-3">
            <Calendar className="w-7 h-7 text-primary" />
            Reservas
          </h1>
          <p className="text-white/50 mt-1">Solicitações de transporte recebidas</p>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { key: "todos", label: "Total", count: counts.todos, cls: "text-white", border: "border-white/10" },
            { key: "novo", label: "Novos", count: counts.novo, cls: "text-blue-400", border: "border-blue-400/20" },
            { key: "em_analise", label: "Em Análise", count: counts.em_analise, cls: "text-yellow-400", border: "border-yellow-400/20" },
            { key: "aprovado", label: "Aprovados", count: counts.aprovado, cls: "text-green-400", border: "border-green-400/20" },
          ].map(s => (
            <button key={s.key} onClick={() => setFilter(s.key)}
              className={`bg-card border ${s.border} rounded-2xl p-5 text-left transition-all ${filter === s.key ? "ring-2 ring-primary/30" : "hover:border-white/20"}`}>
              <p className="text-white/50 text-sm">{s.label}</p>
              <p className={`text-3xl font-black ${s.cls}`}>{s.count}</p>
            </button>
          ))}
        </div>

        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-24 bg-card rounded-2xl mb-3 animate-pulse" />)
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-bold">Nenhuma reserva {filter !== "todos" ? `com status "${filter}"` : "recebida"}</p>
            <p className="text-sm mt-1">As solicitações do formulário aparecerão aqui automaticamente</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(r => (
              <ReservationCard
                key={r.id} r={r}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onGenerateLink={handleGenerateLink}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
