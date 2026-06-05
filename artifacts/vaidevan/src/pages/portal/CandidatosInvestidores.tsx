import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { api, ApiInvestorApplication, ApprovalStatus } from "@/lib/api";
import {
  ShieldCheck, Clock, AlertTriangle, UserCheck, UserX, Eye,
  FileText, MapPin, Monitor, ChevronDown, StickyNote, KeyRound,
  Phone, Mail, Building2, Users2,
} from "lucide-react";

const STATUS_MAP: Record<ApprovalStatus, { label: string; cls: string; Icon: React.ElementType }> = {
  pending_kyc:  { label: "Aguardando",   cls: "text-yellow-400 bg-yellow-400/10", Icon: Clock },
  under_review: { label: "Em Análise",   cls: "text-blue-400   bg-blue-400/10",   Icon: ShieldCheck },
  approved:     { label: "Aprovado",     cls: "text-green-400  bg-green-400/10",  Icon: UserCheck },
  suspended:    { label: "Suspenso",     cls: "text-red-400    bg-red-400/10",    Icon: UserX },
};

const PATRIMONY_LABELS: Record<string, string> = {
  ate_100k:  "Até R$ 100 mil",
  "100k_500k": "R$ 100 mil – R$ 500 mil",
  "500k_1m": "R$ 500 mil – R$ 1 milhão",
  acima_1m:  "Acima de R$ 1 milhão",
};

const SOURCE_LABELS: Record<string, string> = {
  renda_emprego: "Renda de emprego",
  renda_empresa: "Renda de empresa própria",
  investimentos: "Investimentos",
  heranca: "Herança",
  imoveis: "Imóveis",
  outro: "Outro",
};

function StatusBadge({ status }: { status: ApprovalStatus }) {
  const s = STATUS_MAP[status] || STATUS_MAP.pending_kyc;
  return (
    <span className={`flex items-center gap-1.5 text-xs font-bold rounded-full px-3 py-1 ${s.cls}`}>
      <s.Icon className="w-3.5 h-3.5" />{s.label}
    </span>
  );
}

function DocStatusBadge({ status }: { status: string }) {
  const cls = status === "aprovado"
    ? "text-green-400 bg-green-400/10"
    : status === "rejeitado"
    ? "text-red-400 bg-red-400/10"
    : "text-yellow-400 bg-yellow-400/10";
  return (
    <span className={`text-xs font-bold rounded-full px-2 py-0.5 ${cls}`}>{status}</span>
  );
}

function CandidatoCard({
  candidato,
  onReview,
  onApprove,
  onReject,
  onSaveNotes,
  onResetPassword,
}: {
  candidato: ApiInvestorApplication;
  onReview: (id: number) => Promise<void>;
  onApprove: (id: number, data: { approvedBy: string; kycNotes?: string; temporaryPassword?: string }) => Promise<void>;
  onReject: (id: number, data: { rejectedReason?: string; kycNotes?: string }) => Promise<void>;
  onSaveNotes: (id: number, notes: string) => Promise<void>;
  onResetPassword: (id: number, pwd: string) => Promise<void>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notes, setNotes] = useState(candidato.kycNotes || "");
  const [approvedBy, setApprovedBy] = useState("");
  const [tempPwd, setTempPwd] = useState("");
  const [rejectedReason, setRejectedReason] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [msg, setMsg] = useState("");

  const app = candidato.application;

  const act = async (fn: () => Promise<void>) => {
    setBusy(true);
    setMsg("");
    try { await fn(); }
    catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Erro"); }
    finally { setBusy(false); }
  };

  return (
    <div className="bg-card border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-colors">
      {/* Cabeçalho */}
      <div className="p-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-black text-lg">
            {candidato.name[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-black text-white">{candidato.name}</p>
              {candidato.govBrVerified && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-400/10 text-green-400">Gov.br ✓</span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="flex items-center gap-1 text-white/40 text-xs"><Mail className="w-3 h-3" />{candidato.email}</span>
              {candidato.phone && <span className="flex items-center gap-1 text-white/40 text-xs"><Phone className="w-3 h-3" />{candidato.phone}</span>}
              {(candidato.city || candidato.state) && (
                <span className="flex items-center gap-1 text-white/40 text-xs">
                  <MapPin className="w-3 h-3" />{[candidato.city, candidato.state].filter(Boolean).join(" – ")}
                </span>
              )}
            </div>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <StatusBadge status={candidato.approvalStatus} />
              <span className="text-white/30 text-xs">
                {new Date(candidato.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setExpanded(e => !e)}
          className="text-white/30 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-all"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-white/5 px-5 py-5 space-y-5">

          {/* Dados pessoais */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {candidato.cpf && <div><span className="text-white/30">CPF:</span> <span className="text-white/70">{candidato.cpf}</span></div>}
            {app?.cnpj && <div><span className="text-white/30">CNPJ:</span> <span className="text-white/70">{app.cnpj}</span></div>}
            {app?.companyName && <div className="col-span-2"><span className="text-white/30">Empresa:</span> <span className="text-white/70">{app.companyName}</span></div>}
          </div>

          {/* Perfil KYC */}
          {app && (app.occupation || app.patrimony || app.sourceOfFunds || app.investmentIntent) && (
            <div className="bg-background/60 rounded-xl p-4 space-y-2">
              <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-3">Perfil KYC</p>
              {app.occupation && (
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-white/30" />
                  <span className="text-xs text-white/50">Profissão:</span>
                  <span className="text-xs text-white/80">{app.occupation}</span>
                </div>
              )}
              {app.patrimony && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/50">Patrimônio:</span>
                  <span className="text-xs font-bold text-primary">{PATRIMONY_LABELS[app.patrimony] || app.patrimony}</span>
                </div>
              )}
              {app.sourceOfFunds && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/50">Origem dos recursos:</span>
                  <span className="text-xs text-white/80">{SOURCE_LABELS[app.sourceOfFunds] || app.sourceOfFunds}</span>
                </div>
              )}
              {app.investmentIntent && (
                <div className="bg-background/80 rounded-lg p-3 mt-2">
                  <p className="text-white/40 text-xs font-bold mb-1">Intenção de investimento</p>
                  <p className="text-white/70 text-sm leading-relaxed">{app.investmentIntent}</p>
                </div>
              )}
              {app.competitorDeclaration !== undefined && (
                <div className={`flex items-center gap-2 rounded-lg px-3 py-2 ${app.competitorDeclaration ? "bg-green-400/5 border border-green-400/20" : "bg-red-400/5 border border-red-400/20"}`}>
                  <span className={`text-xs font-bold ${app.competitorDeclaration ? "text-green-400" : "text-red-400"}`}>
                    {app.competitorDeclaration ? "✓ Declarou não ser concorrente" : "✗ Não declarou ser não-concorrente"}
                  </span>
                </div>
              )}
              {app.howFound && (
                <p className="text-xs text-white/40">Como nos encontrou: <span className="text-white/60">{app.howFound}</span></p>
              )}
              {app.message && (
                <div className="bg-background/80 rounded-lg p-3">
                  <p className="text-white/40 text-xs font-bold mb-1">Mensagem</p>
                  <p className="text-white/70 text-sm">{app.message}</p>
                </div>
              )}
            </div>
          )}

          {/* Documentos */}
          <div className="bg-background/60 rounded-xl p-4 space-y-2">
            <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-3">Documentos</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />CNH Digital
              </span>
              <div className="flex items-center gap-2">
                <DocStatusBadge status={candidato.cnhStatus} />
                {app?.cnhUrl && (
                  <a href={`/api/storage${app.cnhUrl}`} target="_blank" rel="noopener noreferrer"
                    className="text-primary/60 hover:text-primary text-xs underline flex items-center gap-1">
                    <Eye className="w-3 h-3" />Ver
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />Comprovante de Endereço
              </span>
              <div className="flex items-center gap-2">
                <DocStatusBadge status={candidato.addressProofStatus} />
                {app?.addressProofUrl && (
                  <a href={`/api/storage${app.addressProofUrl}`} target="_blank" rel="noopener noreferrer"
                    className="text-primary/60 hover:text-primary text-xs underline flex items-center gap-1">
                    <Eye className="w-3 h-3" />Ver
                  </a>
                )}
              </div>
            </div>
            {app?.selfieUrl && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/50 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" />Selfie com documento
                </span>
                <a href={`/api/storage${app.selfieUrl}`} target="_blank" rel="noopener noreferrer"
                  className="text-primary/60 hover:text-primary text-xs underline flex items-center gap-1">
                  <Eye className="w-3 h-3" />Ver
                </a>
              </div>
            )}
          </div>

          {/* Referências comerciais */}
          {app?.commercialRefs && app.commercialRefs.length > 0 && (
            <div className="bg-background/60 rounded-xl p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <Users2 className="w-3.5 h-3.5 text-primary" />
                <p className="text-white/40 text-xs font-bold uppercase tracking-wider">Referências Comerciais</p>
              </div>
              <div className="space-y-2">
                {app.commercialRefs.map((ref, i) => (
                  <div key={i} className="text-xs text-white/60">
                    <span className="font-bold text-white/80">{ref.name}</span> · {ref.phone} · {ref.email}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Auditoria de segurança */}
          <div className="bg-background/60 rounded-xl p-4 space-y-2">
            <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-3">Auditoria de Segurança</p>
            {candidato.registrationIp && (
              <div className="flex items-center gap-2 text-xs">
                <Monitor className="w-3.5 h-3.5 text-white/30" />
                <span className="text-white/40">IP:</span>
                <span className="text-white/70 font-mono">{candidato.registrationIp}</span>
              </div>
            )}
            {candidato.registrationUserAgent && (
              <div className="flex items-start gap-2 text-xs">
                <Monitor className="w-3.5 h-3.5 text-white/30 mt-0.5 flex-shrink-0" />
                <span className="text-white/40 flex-shrink-0">Dispositivo:</span>
                <span className="text-white/50 break-all">{candidato.registrationUserAgent}</span>
              </div>
            )}
            {app?.registrationGeoLat != null && app?.registrationGeoLng != null && (
              <div className="flex items-center gap-2 bg-green-400/5 border border-green-400/20 rounded-lg px-3 py-2">
                <MapPin className="w-3.5 h-3.5 text-green-400 shrink-0" />
                <div>
                  <p className="text-green-300 text-xs font-bold">Localização de registro</p>
                  <p className="text-green-200/60 text-xs font-mono">
                    {app.registrationGeoLat.toFixed(6)}, {app.registrationGeoLng.toFixed(6)}
                    {app.registrationGeoAccuracy != null && ` · ±${Math.round(app.registrationGeoAccuracy)}m`}
                  </p>
                  <a
                    href={`https://maps.google.com/?q=${app.registrationGeoLat},${app.registrationGeoLng}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-green-400/60 hover:text-green-400 text-xs underline"
                  >
                    Ver no Maps →
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Notas internas KYC */}
          <div className="bg-background/60 rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <StickyNote className="w-3.5 h-3.5 text-primary" />
              <p className="text-white/40 text-xs font-bold uppercase tracking-wider">Notas Internas KYC</p>
              <span className="text-white/20 text-xs ml-1">(nunca visíveis ao investidor)</span>
            </div>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              placeholder="Ex: Confirmado via LinkedIn. Escritório em Pinheiros. Não há indícios de concorrência..."
              className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-white/70 text-sm placeholder-white/20 focus:outline-none focus:border-primary resize-none"
            />
            <button
              disabled={busy}
              onClick={() => act(() => onSaveNotes(candidato.id, notes))}
              className="mt-2 text-xs text-primary/70 hover:text-primary underline disabled:opacity-40"
            >
              Salvar notas
            </button>
          </div>

          {/* Ações de aprovação */}
          {(candidato.approvalStatus === "pending_kyc" || candidato.approvalStatus === "under_review") && (
            <div className="space-y-3">
              {candidato.approvalStatus === "pending_kyc" && (
                <button
                  disabled={busy}
                  onClick={() => act(() => onReview(candidato.id))}
                  className="w-full py-2.5 rounded-xl bg-blue-400/10 border border-blue-400/20 text-blue-400 text-sm font-bold hover:bg-blue-400/20 transition-colors disabled:opacity-40"
                >
                  Mover para "Em Análise"
                </button>
              )}

              {/* Aprovação */}
              <div className="bg-green-400/5 border border-green-400/20 rounded-xl p-4 space-y-3">
                <p className="text-green-400 text-xs font-bold uppercase tracking-wider">Aprovar Investidor</p>
                <input
                  value={approvedBy}
                  onChange={e => setApprovedBy(e.target.value)}
                  placeholder="Seu nome (responsável pela aprovação) *"
                  className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-white/70 text-sm placeholder-white/20 focus:outline-none focus:border-green-400"
                />
                <input
                  value={tempPwd}
                  onChange={e => setTempPwd(e.target.value)}
                  placeholder="Senha inicial do portal (opcional)"
                  type="password"
                  className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-white/70 text-sm placeholder-white/20 focus:outline-none focus:border-green-400"
                />
                <button
                  disabled={busy || !approvedBy.trim()}
                  onClick={() => act(() => onApprove(candidato.id, {
                    approvedBy: approvedBy.trim(),
                    kycNotes: notes || undefined,
                    temporaryPassword: tempPwd.trim() || undefined,
                  }))}
                  className="w-full py-2.5 rounded-xl bg-green-500 text-black text-sm font-black hover:bg-green-400 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  {busy ? "Aprovando..." : "Liberar Acesso ao Portal"}
                </button>
              </div>

              {/* Reprovação */}
              <div className="bg-red-400/5 border border-red-400/20 rounded-xl p-4 space-y-3">
                <p className="text-red-400 text-xs font-bold uppercase tracking-wider">Reprovar / Suspender</p>
                <input
                  value={rejectedReason}
                  onChange={e => setRejectedReason(e.target.value)}
                  placeholder="Motivo da reprovação (opcional)"
                  className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-white/70 text-sm placeholder-white/20 focus:outline-none focus:border-red-400"
                />
                <button
                  disabled={busy}
                  onClick={() => act(() => onReject(candidato.id, {
                    rejectedReason: rejectedReason || undefined,
                    kycNotes: notes || undefined,
                  }))}
                  className="w-full py-2.5 rounded-xl bg-red-400/10 border border-red-400/30 text-red-400 text-sm font-bold hover:bg-red-400/20 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  <UserX className="w-4 h-4" />
                  {busy ? "Reprovando..." : "Reprovar Candidato"}
                </button>
              </div>
            </div>
          )}

          {/* Reset de senha para aprovados */}
          {candidato.approvalStatus === "approved" && (
            <div className="bg-background/60 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5 text-primary" />
                <p className="text-white/40 text-xs font-bold uppercase tracking-wider">Redefinir Senha</p>
              </div>
              <input
                value={newPwd}
                onChange={e => setNewPwd(e.target.value)}
                placeholder="Nova senha (mín. 8 caracteres)"
                type="password"
                className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-white/70 text-sm placeholder-white/20 focus:outline-none focus:border-primary"
              />
              <button
                disabled={busy || newPwd.length < 8}
                onClick={() => act(async () => {
                  await onResetPassword(candidato.id, newPwd);
                  setNewPwd("");
                  setMsg("Senha redefinida com sucesso.");
                })}
                className="py-2 px-4 rounded-xl bg-primary/10 border border-primary/30 text-primary text-sm font-bold hover:bg-primary/20 transition-colors disabled:opacity-40"
              >
                {busy ? "Redefinindo..." : "Redefinir Senha"}
              </button>
            </div>
          )}

          {/* Status já aprovado/suspenso */}
          {candidato.approvalStatus === "approved" && candidato.approvedBy && (
            <div className="text-xs text-green-400/60 bg-green-400/5 rounded-xl px-4 py-3">
              Aprovado por <strong>{candidato.approvedBy}</strong> em{" "}
              {candidato.approvedAt ? new Date(candidato.approvedAt).toLocaleDateString("pt-BR") : "—"}
            </div>
          )}
          {candidato.approvalStatus === "suspended" && candidato.rejectedReason && (
            <div className="text-xs text-red-400/60 bg-red-400/5 rounded-xl px-4 py-3">
              Motivo da reprovação: <strong>{candidato.rejectedReason}</strong>
            </div>
          )}

          {msg && (
            <p className={`text-xs text-center px-4 py-2 rounded-xl ${msg.startsWith("Erro") ? "text-red-400 bg-red-400/10" : "text-green-400 bg-green-400/10"}`}>
              {msg}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Pontuação de risco anti-especulador (0 = sem risco, 100 = alto risco)
function calcRiskScore(c: ApiInvestorApplication): { score: number; flags: string[] } {
  const flags: string[] = [];
  let score = 0;

  const app = c.application;

  // Sem patrimônio declarado = risco
  if (!app?.patrimony) { score += 25; flags.push("Patrimônio não declarado"); }
  else if (app.patrimony === "ate_100k") { score += 15; flags.push("Patrimônio baixo"); }

  // Sem intenção de investimento definida
  if (!app?.investmentIntent || app.investmentIntent.trim().length < 20) {
    score += 20; flags.push("Intenção vaga ou ausente");
  }

  // Não declarou não ser concorrente
  if (app?.competitorDeclaration === false) {
    score += 30; flags.push("⚠️ Não declarou não ser concorrente");
  }
  if (app?.competitorDeclaration === undefined || app?.competitorDeclaration === null) {
    score += 10; flags.push("Declaração de concorrência ausente");
  }

  // Sem referências comerciais
  if (!app?.commercialRefs || app.commercialRefs.length === 0) {
    score += 15; flags.push("Sem referências comerciais");
  }

  // Sem verificação Gov.BR
  if (!c.govBrVerified) { score += 10; flags.push("Face ID / Gov.BR não verificado"); }

  // Sem documentos enviados
  if (c.cnhStatus === "pendente" || !app?.cnhUrl) { score += 10; flags.push("CNH não enviada"); }

  return { score: Math.min(100, score), flags };
}

function RiskBadge({ score }: { score: number }) {
  if (score >= 60) return <span className="text-xs font-black text-red-400 bg-red-400/10 border border-red-400/20 px-2.5 py-1 rounded-full">⚠ Risco Alto {score}</span>;
  if (score >= 30) return <span className="text-xs font-black text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2.5 py-1 rounded-full">⚡ Risco Médio {score}</span>;
  return <span className="text-xs font-black text-green-400 bg-green-400/10 border border-green-400/20 px-2.5 py-1 rounded-full">✓ Baixo Risco {score}</span>;
}

const PATRIMONY_FILTER: Record<string, string> = {
  todos: "Todos os patrimônios",
  ate_100k: "Até R$ 100k",
  "100k_500k": "R$ 100k–500k",
  "500k_1m": "R$ 500k–1M",
  acima_1m: "Acima de R$ 1M",
};

export default function CandidatosInvestidores() {
  const [candidatos, setCandidatos] = useState<ApiInvestorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("todos");
  const [search, setSearch] = useState("");
  const [patrimonyFilter, setPatrimonyFilter] = useState("todos");
  const [sortBy, setSortBy] = useState<"date" | "risk_asc" | "risk_desc">("date");
  const [showHighRiskOnly, setShowHighRiskOnly] = useState(false);

  const load = () => {
    setLoading(true);
    api.investorApplications().then(setCandidatos).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleReview = async (id: number) => {
    await api.reviewInvestorApplication(id);
    setCandidatos(cs => cs.map(c => c.id === id ? { ...c, approvalStatus: "under_review" } : c));
  };

  const handleApprove = async (id: number, data: { approvedBy: string; kycNotes?: string; temporaryPassword?: string }) => {
    const result = await api.approveInvestorApplication(id, data);
    setCandidatos(cs => cs.map(c => c.id === id ? { ...c, approvalStatus: "approved", approvedBy: data.approvedBy, approvedAt: new Date().toISOString() } : c));
    alert(`✅ ${result.message}`);
  };

  const handleReject = async (id: number, data: { rejectedReason?: string; kycNotes?: string }) => {
    await api.rejectInvestorApplication(id, data);
    setCandidatos(cs => cs.map(c => c.id === id ? { ...c, approvalStatus: "suspended", rejectedReason: data.rejectedReason || null } : c));
  };

  const handleSaveNotes = async (id: number, kycNotes: string) => {
    await api.updateInvestorNotes(id, kycNotes);
    setCandidatos(cs => cs.map(c => c.id === id ? { ...c, kycNotes } : c));
  };

  const handleResetPassword = async (id: number, newPassword: string) => {
    await api.resetInvestorPassword(id, newPassword);
  };

  const counts = {
    todos:        candidatos.length,
    pending_kyc:  candidatos.filter(c => c.approvalStatus === "pending_kyc").length,
    under_review: candidatos.filter(c => c.approvalStatus === "under_review").length,
    approved:     candidatos.filter(c => c.approvalStatus === "approved").length,
    suspended:    candidatos.filter(c => c.approvalStatus === "suspended").length,
    high_risk:    candidatos.filter(c => calcRiskScore(c).score >= 60).length,
  };

  const q = search.toLowerCase().trim();
  const filtered = candidatos
    .filter(c => filter === "todos" || c.approvalStatus === filter)
    .filter(c => !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.phone ?? "").includes(q))
    .filter(c => patrimonyFilter === "todos" || c.application?.patrimony === patrimonyFilter)
    .filter(c => !showHighRiskOnly || calcRiskScore(c).score >= 60)
    .sort((a, b) => {
      if (sortBy === "risk_asc") return calcRiskScore(a).score - calcRiskScore(b).score;
      if (sortBy === "risk_desc") return calcRiskScore(b).score - calcRiskScore(a).score;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-black text-white flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-primary" />
            Candidatos a Investidor
          </h1>
          <p className="text-white/50 mt-1">Revisão e aprovação de acesso ao Portal do Investidor</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 mb-5">
          {[
            { key: "todos",        label: "Total",        count: counts.todos,        cls: "text-white",       border: "border-white/10" },
            { key: "pending_kyc",  label: "Aguardando",   count: counts.pending_kyc,  cls: "text-yellow-400",  border: "border-yellow-400/20" },
            { key: "under_review", label: "Em análise",   count: counts.under_review, cls: "text-blue-400",    border: "border-blue-400/20" },
            { key: "approved",     label: "Aprovados",    count: counts.approved,     cls: "text-green-400",   border: "border-green-400/20" },
            { key: "suspended",    label: "Suspensos",    count: counts.suspended,    cls: "text-red-400",     border: "border-red-400/20" },
          ].map(s => (
            <button key={s.key} onClick={() => setFilter(s.key)}
              className={`bg-card border ${s.border} rounded-xl p-3 text-left transition-all ${filter === s.key ? "ring-2 ring-primary/40" : "hover:border-white/20"}`}>
              <p className="text-white/40 text-xs">{s.label}</p>
              <p className={`text-xl font-black ${s.cls}`}>{s.count}</p>
            </button>
          ))}
          {/* Alto risco */}
          <button onClick={() => setShowHighRiskOnly(v => !v)}
            className={`bg-card border rounded-xl p-3 text-left transition-all ${showHighRiskOnly ? "border-red-400/50 ring-2 ring-red-400/30 bg-red-400/5" : "border-red-400/20 hover:border-red-400/40"}`}>
            <p className="text-white/40 text-xs">Alto Risco</p>
            <p className="text-xl font-black text-red-400">{counts.high_risk}</p>
          </button>
        </div>

        {/* Filtros e busca */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-48">
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome, e-mail ou telefone…"
              className="w-full bg-card border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-primary/50 transition-colors" />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <select value={patrimonyFilter} onChange={e => setPatrimonyFilter(e.target.value)}
            className="bg-card border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50 transition-colors">
            {Object.entries(PATRIMONY_FILTER).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="bg-card border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50 transition-colors">
            <option value="date">Mais recentes</option>
            <option value="risk_desc">Maior risco primeiro</option>
            <option value="risk_asc">Menor risco primeiro</option>
          </select>
        </div>

        {/* Aviso anti-especulador */}
        <div className="mb-5 bg-red-400/5 border border-red-400/20 rounded-2xl p-4 flex gap-3">
          <ShieldCheck className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-300 text-sm font-bold">Proteção Anti-Especulador</p>
            <p className="text-white/50 text-xs mt-1 leading-relaxed">
              Candidatos com <strong className="text-red-400">pontuação ≥ 60</strong> são marcados como Alto Risco.
              Critérios: patrimônio não declarado, sem intenção de investimento, declaração de concorrência ausente,
              ausência de referências comerciais e identidade não verificada. Revise todos antes de aprovar.
            </p>
          </div>
        </div>

        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-24 bg-card rounded-2xl mb-3 animate-pulse" />)
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-bold">Nenhum candidato encontrado</p>
            <p className="text-sm mt-1">Ajuste os filtros ou a busca</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(c => {
              const { score, flags } = calcRiskScore(c);
              return (
                <div key={c.id}>
                  {score >= 30 && (
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <RiskBadge score={score} />
                      {flags.slice(0, 2).map(f => (
                        <span key={f} className="text-xs text-white/30 hidden md:inline">{f}</span>
                      ))}
                      {flags.length > 2 && <span className="text-xs text-white/20 hidden md:inline">+{flags.length - 2} alertas</span>}
                    </div>
                  )}
                  <CandidatoCard
                    candidato={c}
                    onReview={handleReview}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onSaveNotes={handleSaveNotes}
                    onResetPassword={handleResetPassword}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
