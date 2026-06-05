import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { api } from "@/lib/api";
import {
  CheckCircle2, AlertTriangle, ArrowLeft,
  CreditCard, QrCode, Loader2, ExternalLink, Clock,
} from "lucide-react";

const VEHICLE_LABELS: Record<string, string> = {
  van_executiva: "Van Executiva",
  van_premium: "Van Premium",
  micro_onibus: "Micro-ônibus",
  onibus: "Ônibus",
};

type PayReservation = {
  id: number; name: string; email: string; cpf: string | null; phone: string;
  vehicleType: string; startDate: string; endDate: string;
  originAddress: string; destinationAddress: string;
  paymentAmount: number | null;
  paymentStatus: string;
  stripeCheckoutUrl: string | null;
  mpCheckoutUrl: string | null;
  ipayCheckoutUrl: string | null;
  status: string;
  alreadyPaid?: boolean;
};

type Gateway = "stripe" | "mercadopago" | "infinitepay";

function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const GATEWAYS: {
  key: Gateway;
  label: string;
  sub: string;
  bg: string;
  hover: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "stripe",
    label: "Cartão Internacional",
    sub: "Visa, Mastercard, Amex — via Stripe",
    bg: "bg-[#635BFF]",
    hover: "hover:bg-[#4f48e2]",
    icon: <CreditCard className="w-5 h-5" />,
  },
  {
    key: "mercadopago",
    label: "Mercado Pago",
    sub: "Cartão, PIX ou boleto",
    bg: "bg-[#009EE3]",
    hover: "hover:bg-[#0086c1]",
    icon: <CreditCard className="w-5 h-5" />,
  },
  {
    key: "infinitepay",
    label: "InfinityPay",
    sub: "PIX ou cartão de crédito",
    bg: "bg-[#6C1ED6]",
    hover: "hover:bg-[#5a19b3]",
    icon: <QrCode className="w-5 h-5" />,
  },
];

export default function Pagamento() {
  const params = useParams<{ id: string }>();
  const [location] = useLocation();
  const id = Number(params.id);

  const [reservation, setReservation] = useState<PayReservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paid, setPaid] = useState(false);
  const [redirecting, setRedirecting] = useState<Gateway | null>(null);
  const [payError, setPayError] = useState("");

  const searchParams = new URLSearchParams(location.split("?")[1] ?? "");
  const gatewayStatus = searchParams.get("status");

  useEffect(() => {
    api.getReservationForPayment(id)
      .then(r => {
        setReservation(r as PayReservation);
        if (r.paymentStatus === "pago") setPaid(true);
      })
      .catch(e => setError(e instanceof Error ? e.message : "Reserva não encontrada."))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePay = async (gateway: Gateway) => {
    setRedirecting(gateway);
    setPayError("");
    try {
      const result = await api.createPaymentLink(id, gateway);
      window.location.href = result.checkoutUrl;
    } catch (e) {
      setPayError(e instanceof Error ? e.message : "Erro ao gerar link de pagamento.");
      setRedirecting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-white font-bold">{error || "Reserva não encontrada."}</p>
          <Link href="/" className="text-primary/70 hover:text-primary text-sm mt-4 block">← Voltar ao site</Link>
        </div>
      </div>
    );
  }

  if (paid) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 bg-green-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-2xl font-black text-white mb-3">Pagamento Confirmado!</h1>
          <p className="text-white/60 mb-2">Protocolo <span className="text-primary font-bold">#{reservation.id}</span></p>
          <p className="text-white/50 text-sm mb-6">Nossa equipe confirmará sua reserva em breve.</p>
          <Link href="/" className="text-primary/70 hover:text-primary text-sm">← Voltar ao site</Link>
        </div>
      </div>
    );
  }

  const isApproved = reservation.status === "aprovado";
  const hasAmount = (reservation.paymentAmount ?? 0) > 0;

  // Links já gerados
  const existingLinks: { gateway: Gateway; url: string }[] = [
    ...(reservation.stripeCheckoutUrl ? [{ gateway: "stripe" as Gateway, url: reservation.stripeCheckoutUrl }] : []),
    ...(reservation.mpCheckoutUrl ? [{ gateway: "mercadopago" as Gateway, url: reservation.mpCheckoutUrl }] : []),
    ...(reservation.ipayCheckoutUrl ? [{ gateway: "infinitepay" as Gateway, url: reservation.ipayCheckoutUrl }] : []),
  ];

  return (
    <>
      <Helmet>
        <title>{`Pagamento — Reserva #${id} — VaideVan`}</title>
      </Helmet>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-white/5 px-6 py-4 flex items-center gap-4">
          <Link href="/" className="text-white/40 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-white font-black text-lg">Pagamento</h1>
            <p className="text-white/40 text-xs">Reserva #{id} · VaideVan</p>
          </div>
        </div>

        <div className="max-w-md mx-auto p-6 space-y-5">
          {/* Banner retorno gateway */}
          {gatewayStatus === "failure" && (
            <div className="bg-red-400/10 border border-red-400/20 rounded-2xl p-4 flex items-center gap-3 text-red-300 text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              Pagamento não concluído. Tente novamente ou escolha outro método.
            </div>
          )}
          {gatewayStatus === "pending" && (
            <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-2xl p-4 flex items-center gap-3 text-yellow-300 text-sm">
              <Clock className="w-5 h-5 shrink-0" />
              Pagamento pendente de confirmação. Você será notificado por e-mail.
            </div>
          )}

          {/* Resumo */}
          <div className="bg-card border border-white/10 rounded-2xl p-5">
            <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-3">Resumo da Reserva</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Cliente</span>
                <span className="text-white font-bold">{reservation.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Veículo</span>
                <span className="text-white">{VEHICLE_LABELS[reservation.vehicleType] ?? reservation.vehicleType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Período</span>
                <span className="text-white">{reservation.startDate} → {reservation.endDate}</span>
              </div>
              <div className="flex justify-between text-xs text-white/50">
                <span>Origem</span>
                <span className="text-right max-w-[60%] truncate">{reservation.originAddress}</span>
              </div>
              <div className="border-t border-white/10 pt-2 mt-2 flex justify-between">
                <span className="text-white/60">Total</span>
                <span className="text-primary font-black text-lg">
                  {hasAmount ? fmt(reservation.paymentAmount!) : "A confirmar"}
                </span>
              </div>
            </div>
          </div>

          {/* Estado: aguardando aprovação */}
          {(!isApproved || !hasAmount) && (
            <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-2xl p-6 text-center">
              <Clock className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
              <h2 className="text-white font-bold mb-2">Aguardando confirmação</h2>
              <p className="text-white/50 text-sm mb-4">
                Sua reserva está sendo analisada. O pagamento será liberado assim que nossa equipe confirmar o valor.
              </p>
              <a href={`https://wa.me/5511999294694?text=Olá!%20Quero%20confirmar%20minha%20reserva%20%23${id}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 px-5 rounded-xl transition-colors text-sm">
                📱 Falar no WhatsApp
              </a>
            </div>
          )}

          {/* Métodos de pagamento */}
          {isApproved && hasAmount && (
            <div className="space-y-3">
              <p className="text-white/60 text-xs font-bold uppercase tracking-wider">Escolha como pagar</p>

              {payError && (
                <div className="bg-red-400/10 border border-red-400/20 rounded-xl p-3 flex items-center gap-2 text-red-300 text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0" />{payError}
                </div>
              )}

              {GATEWAYS.map(({ key, label, sub, bg, hover, icon }) => (
                <button
                  key={key}
                  onClick={() => handlePay(key)}
                  disabled={redirecting !== null}
                  className={`w-full ${bg} ${hover} disabled:opacity-60 text-white font-black py-4 px-6 rounded-2xl transition-colors flex items-center justify-between gap-3 group`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      {icon}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-black">{label}</p>
                      <p className="text-white/70 text-xs font-normal">{sub}</p>
                    </div>
                  </div>
                  {redirecting === key
                    ? <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
                    : <ExternalLink className="w-4 h-4 opacity-60 group-hover:opacity-100 flex-shrink-0" />
                  }
                </button>
              ))}

              <p className="text-white/25 text-xs text-center pt-1">
                🔒 Você será redirecionado para o ambiente seguro do gateway de pagamento.
              </p>

              {/* Links já gerados anteriormente */}
              {existingLinks.length > 0 && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2">
                  <p className="text-primary text-xs font-bold">Links gerados anteriormente:</p>
                  {existingLinks.map(({ gateway, url }) => {
                    const gw = GATEWAYS.find(g => g.key === gateway);
                    return (
                      <a key={gateway} href={url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-white/60 text-xs hover:text-white transition-colors">
                        <ExternalLink className="w-3 h-3" />
                        Pagar via {gw?.label ?? gateway}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Suporte */}
          <div className="text-center pt-2">
            <a href={`https://wa.me/5511999294694?text=Dúvida%20sobre%20reserva%20%23${id}`}
              target="_blank" rel="noopener noreferrer"
              className="text-white/30 hover:text-white/60 text-xs transition-colors">
              Precisa de ajuda? Fale no WhatsApp →
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
