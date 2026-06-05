import { useEffect, useState } from "react";
import { useAuth, ApprovalStatus } from "@/context/AuthContext";
import { useLocation } from "wouter";
import { Clock, ShieldCheck, Mail, Phone, AlertTriangle, LogOut, RefreshCw, CheckCircle2 } from "lucide-react";

const STATUS_INFO: Record<ApprovalStatus, {
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  title: string;
  subtitle: string;
}> = {
  pending_kyc: {
    icon: Clock,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/20",
    title: "Cadastro em Análise",
    subtitle: "Recebemos seu cadastro! Nossa equipe irá analisá-lo e você receberá um retorno em breve.",
  },
  under_review: {
    icon: ShieldCheck,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
    title: "Em Análise pela Equipe",
    subtitle: "Seu cadastro está sendo analisado por um de nossos especialistas. Em breve entraremos em contato.",
  },
  approved: {
    icon: CheckCircle2,
    color: "text-green-400",
    bg: "bg-green-400/10",
    border: "border-green-400/20",
    title: "Aprovado",
    subtitle: "Acesso liberado. Redirecionando para o portal...",
  },
  suspended: {
    icon: AlertTriangle,
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/20",
    title: "Acesso Suspenso",
    subtitle: "Sua conta foi suspensa ou o cadastro não pôde ser aprovado. Entre em contato conosco para mais informações.",
  },
};

const STEPS = [
  {
    label: "Análise documental",
    description: "Verificação de CNH e comprovante de residência",
    statuses: ["pending_kyc", "under_review", "approved"] as ApprovalStatus[],
  },
  {
    label: "Contato do especialista VaideVan",
    description: "Um de nossos especialistas entrará em contato para uma conversa rápida",
    statuses: ["under_review", "approved"] as ApprovalStatus[],
  },
  {
    label: "Liberação de acesso ao portal",
    description: "Acesso completo ao Portal do Investidor e às suas operações",
    statuses: ["approved"] as ApprovalStatus[],
  },
];

export default function AguardandoAprovacao() {
  const { investor, logout, refreshStatus } = useAuth();
  const [, setLocation] = useLocation();
  const [refreshing, setRefreshing] = useState(false);
  const [lastChecked, setLastChecked] = useState(new Date());

  const approvalStatus = (investor?.approvalStatus ?? "pending_kyc") as ApprovalStatus;
  const info = STATUS_INFO[approvalStatus];
  const Icon = info.icon;

  // If investor is now approved, redirect to dashboard
  useEffect(() => {
    if (approvalStatus === "approved") {
      setLocation("/portal/dashboard");
    }
  }, [approvalStatus, setLocation]);

  // Auto-refresh every 60 seconds to detect approval without re-login
  useEffect(() => {
    const interval = setInterval(async () => {
      await refreshStatus();
      setLastChecked(new Date());
    }, 60_000);
    return () => clearInterval(interval);
  }, [refreshStatus]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!investor) {
      setLocation("/portal");
    }
  }, [investor, setLocation]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await refreshStatus();
    setLastChecked(new Date());
    setRefreshing(false);
  };

  if (!investor) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-10">
          <img
            src="/logo-black-sm.webp"
            alt="VaideVan"
            className="h-16 w-auto mx-auto mb-5"
            style={{ mixBlendMode: "screen" }}
          />
        </div>

        {/* Main card */}
        <div
          className={`border ${info.border} rounded-3xl p-8 space-y-6`}
          style={{ backgroundColor: "rgba(255,255,255,0.02)" }}
        >
          {/* Status icon + heading */}
          <div className="text-center space-y-4">
            <div className={`w-20 h-20 rounded-full ${info.bg} flex items-center justify-center mx-auto`}>
              <Icon className={`w-10 h-10 ${info.color}`} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">{info.title}</h1>
              <p className="text-white/50 text-sm mt-2 leading-relaxed max-w-sm mx-auto">
                {info.subtitle}
              </p>
            </div>
          </div>

          {/* Investor info */}
          <div className="bg-white/5 rounded-2xl px-5 py-4 space-y-1">
            <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-2">Sua conta</p>
            <p className="text-white font-bold">{investor.name}</p>
            <p className="text-white/50 text-sm">{investor.email}</p>
          </div>

          {/* 3-step timeline matching the welcome email */}
          {approvalStatus !== "suspended" && (
            <div className="space-y-4">
              <p className="text-white/40 text-xs font-bold uppercase tracking-wider">Etapas do processo</p>
              <div className="space-y-0">
                {STEPS.map((step, i) => {
                  const done = step.statuses.includes(approvalStatus);
                  const active = !done && (
                    (i === 0 && approvalStatus === "pending_kyc") ||
                    (i === 1 && approvalStatus === "under_review")
                  );
                  return (
                    <div key={i} className="flex gap-4">
                      {/* Connector line + dot */}
                      <div className="flex flex-col items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black mt-0.5 ${
                          done
                            ? "bg-primary text-black"
                            : active
                            ? "bg-primary/30 border-2 border-primary text-primary"
                            : "bg-white/10 text-white/30"
                        }`}>
                          {done ? "✓" : i + 1}
                        </div>
                        {i < STEPS.length - 1 && (
                          <div className={`w-px flex-1 my-1 ${done ? "bg-primary/40" : "bg-white/10"}`} style={{ minHeight: 20 }} />
                        )}
                      </div>
                      {/* Content */}
                      <div className="pb-5">
                        <p className={`text-sm font-bold leading-snug ${done ? "text-white" : active ? "text-primary/90" : "text-white/30"}`}>
                          {step.label}
                        </p>
                        <p className={`text-xs mt-0.5 leading-relaxed ${done ? "text-white/50" : active ? "text-white/40" : "text-white/20"}`}>
                          {step.description}
                        </p>
                        {active && (
                          <span className="inline-block mt-1.5 text-xs font-bold text-primary/80 bg-primary/10 rounded-full px-2 py-0.5">
                            Em andamento
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Estimated time — matching welcome email messaging */}
          {(approvalStatus === "pending_kyc" || approvalStatus === "under_review") && (
            <div className="bg-primary/5 border border-primary/20 rounded-2xl px-4 py-3">
              <p className="text-primary/80 text-xs font-bold uppercase tracking-wider mb-1">Prazo estimado</p>
              <p className="text-white/70 text-sm leading-relaxed">
                A análise leva normalmente{" "}
                <strong className="text-white">2 a 5 dias úteis</strong>{" "}
                após o recebimento de toda a documentação. Você será notificado por e-mail em cada etapa.
              </p>
            </div>
          )}

          {/* WhatsApp + Email CTAs */}
          <div className="space-y-3">
            <p className="text-white/30 text-xs text-center">Dúvidas urgentes? Fale conosco:</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <a
                href="https://wa.me/5511999294694?text=Olá%2C%20gostaria%20de%20informações%20sobre%20o%20andamento%20do%20meu%20cadastro%20de%20investidor."
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600/20 border border-green-500/30 text-green-400 rounded-xl text-sm font-bold hover:bg-green-600/30 transition-colors"
              >
                <Phone className="w-4 h-4" />
                WhatsApp
              </a>
              <a
                href="mailto:contato@vaidevan.com?subject=Status%20do%20meu%20cadastro%20de%20investidor"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 text-white/60 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors"
              >
                <Mail className="w-4 h-4" />
                E-mail
              </a>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-5 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/60 text-sm font-bold hover:bg-white/10 transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Verificando..." : "Verificar status"}
          </button>
          <button
            onClick={logout}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-400/5 border border-red-400/20 text-red-400/70 text-sm font-bold hover:bg-red-400/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>

        <p className="text-center text-white/20 text-xs mt-4">
          Última verificação: {lastChecked.toLocaleTimeString("pt-BR")}
        </p>

        <p className="text-center mt-4">
          <a href="/" className="text-white/30 text-xs hover:text-white transition-colors">← Voltar ao site</a>
        </p>
      </div>
    </div>
  );
}
