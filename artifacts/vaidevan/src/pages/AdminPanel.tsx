import { useState, useEffect, useCallback, useRef } from "react";
import {
  ShieldCheck, Clock, AlertTriangle, UserCheck, UserX, Eye,
  FileText, MapPin, Monitor, ChevronDown, StickyNote, KeyRound,
  Phone, Mail, Building2, Users2, Lock, LogOut, RefreshCw,
  Smartphone, X, CheckCircle, Trash2, Copy, Download,
} from "lucide-react";

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "")
  ?? `${import.meta.env.BASE_URL.replace(/\/$/, "")}/api`;

const ADMIN_TOKEN_KEY = "vdv_admin_token";

function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

async function adminRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getAdminToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Erro desconhecido" }));
    throw new Error(err.error || "Erro na requisição");
  }
  return res.json();
}

type ApprovalStatus = "pending_kyc" | "under_review" | "approved" | "suspended";

interface CommercialRef { name: string; phone: string; email: string; }
interface Application {
  cnpj?: string; companyName?: string; occupation?: string; patrimony?: string;
  sourceOfFunds?: string; investmentIntent?: string; competitorDeclaration?: boolean;
  howFound?: string; message?: string; commercialRefs?: CommercialRef[];
  cnhUrl?: string; addressProofUrl?: string; selfieUrl?: string;
  registrationGeoLat?: number; registrationGeoLng?: number; registrationGeoAccuracy?: number;
}
interface Candidato {
  id: number; name: string; email: string; phone?: string; cpf?: string;
  city?: string; state?: string; approvalStatus: ApprovalStatus;
  kycNotes?: string; approvedAt?: string; approvedBy?: string;
  rejectedReason?: string | null; registrationIp?: string; registrationUserAgent?: string;
  cnhStatus: string; addressProofStatus: string; govBrVerified: boolean;
  createdAt: string; application?: Application | null;
}

const STATUS_MAP: Record<ApprovalStatus, { label: string; cls: string; Icon: React.ElementType }> = {
  pending_kyc:  { label: "Aguardando",   cls: "text-yellow-400 bg-yellow-400/10", Icon: Clock },
  under_review: { label: "Em Análise",   cls: "text-blue-400   bg-blue-400/10",   Icon: ShieldCheck },
  approved:     { label: "Aprovado",     cls: "text-green-400  bg-green-400/10",  Icon: UserCheck },
  suspended:    { label: "Suspenso",     cls: "text-red-400    bg-red-400/10",    Icon: UserX },
};

const PATRIMONY_LABELS: Record<string, string> = {
  ate_100k: "Até R$ 100 mil", "100k_500k": "R$ 100 mil – R$ 500 mil",
  "500k_1m": "R$ 500 mil – R$ 1 milhão", acima_1m: "Acima de R$ 1 milhão",
};

const SOURCE_LABELS: Record<string, string> = {
  renda_emprego: "Renda de emprego", renda_empresa: "Renda de empresa própria",
  investimentos: "Investimentos", heranca: "Herança", imoveis: "Imóveis", outro: "Outro",
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
  return <span className={`text-xs font-bold rounded-full px-2 py-0.5 ${cls}`}>{status}</span>;
}

function calcRiskScore(c: Candidato): { score: number; flags: string[] } {
  const flags: string[] = [];
  let score = 0;
  const app = c.application;
  if (!app?.patrimony) { score += 25; flags.push("Patrimônio não declarado"); }
  else if (app.patrimony === "ate_100k") { score += 15; flags.push("Patrimônio baixo"); }
  if (!app?.investmentIntent || app.investmentIntent.trim().length < 20) {
    score += 20; flags.push("Intenção vaga ou ausente");
  }
  if (app?.competitorDeclaration === false) { score += 30; flags.push("⚠️ Não declarou não ser concorrente"); }
  if (app?.competitorDeclaration === undefined || app?.competitorDeclaration === null) {
    score += 10; flags.push("Declaração de concorrência ausente");
  }
  if (!app?.commercialRefs || app.commercialRefs.length === 0) { score += 15; flags.push("Sem referências comerciais"); }
  if (!c.govBrVerified) { score += 10; flags.push("Face ID / Gov.BR não verificado"); }
  if (c.cnhStatus === "pendente" || !app?.cnhUrl) { score += 10; flags.push("CNH não enviada"); }
  return { score: Math.min(100, score), flags };
}

function RiskBadge({ score }: { score: number }) {
  if (score >= 60) return <span className="text-xs font-black text-red-400 bg-red-400/10 border border-red-400/20 px-2.5 py-1 rounded-full">⚠ Risco Alto {score}</span>;
  if (score >= 30) return <span className="text-xs font-black text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2.5 py-1 rounded-full">⚡ Risco Médio {score}</span>;
  return <span className="text-xs font-black text-green-400 bg-green-400/10 border border-green-400/20 px-2.5 py-1 rounded-full">✓ Baixo Risco {score}</span>;
}

function CandidatoCard({
  candidato, onReview, onApprove, onReject, onSaveNotes, onResetPassword,
}: {
  candidato: Candidato;
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
  const { score, flags } = calcRiskScore(candidato);

  const act = async (fn: () => Promise<void>) => {
    setBusy(true); setMsg("");
    try { await fn(); }
    catch (e: unknown) { setMsg(e instanceof Error ? e.message : "Erro"); }
    finally { setBusy(false); }
  };

  return (
    <div className="bg-card border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-colors">
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
              <RiskBadge score={score} />
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
            {score >= 30 && flags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {flags.map((f, i) => (
                  <span key={i} className="text-[10px] text-yellow-300/70 bg-yellow-400/5 border border-yellow-400/10 rounded px-1.5 py-0.5">{f}</span>
                ))}
              </div>
            )}
          </div>
        </div>
        <button onClick={() => setExpanded(e => !e)}
          className="text-white/30 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-all">
          <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-white/5 px-5 py-5 space-y-5">
          <div className="grid grid-cols-2 gap-2 text-xs">
            {candidato.cpf && <div><span className="text-white/30">CPF:</span> <span className="text-white/70">{candidato.cpf}</span></div>}
            {app?.cnpj && <div><span className="text-white/30">CNPJ:</span> <span className="text-white/70">{app.cnpj}</span></div>}
            {app?.companyName && <div className="col-span-2"><span className="text-white/30">Empresa:</span> <span className="text-white/70">{app.companyName}</span></div>}
          </div>

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
              {app.howFound && <p className="text-xs text-white/40">Como nos encontrou: <span className="text-white/60">{app.howFound}</span></p>}
              {app.message && (
                <div className="bg-background/80 rounded-lg p-3">
                  <p className="text-white/40 text-xs font-bold mb-1">Mensagem</p>
                  <p className="text-white/70 text-sm">{app.message}</p>
                </div>
              )}
            </div>
          )}

          <div className="bg-background/60 rounded-xl p-4 space-y-2">
            <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-3">Documentos</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50 flex items-center gap-2"><FileText className="w-3.5 h-3.5" />CNH Digital</span>
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
              <span className="text-xs text-white/50 flex items-center gap-2"><FileText className="w-3.5 h-3.5" />Comprovante de Endereço</span>
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
                <span className="text-xs text-white/50 flex items-center gap-2"><FileText className="w-3.5 h-3.5" />Selfie com documento</span>
                <a href={`/api/storage${app.selfieUrl}`} target="_blank" rel="noopener noreferrer"
                  className="text-primary/60 hover:text-primary text-xs underline flex items-center gap-1">
                  <Eye className="w-3 h-3" />Ver
                </a>
              </div>
            )}
          </div>

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
                  <a href={`https://maps.google.com/?q=${app.registrationGeoLat},${app.registrationGeoLng}`}
                    target="_blank" rel="noopener noreferrer"
                    className="text-green-400/60 hover:text-green-400 text-xs underline">Ver no Maps →</a>
                </div>
              </div>
            )}
          </div>

          <div className="bg-background/60 rounded-xl p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <StickyNote className="w-3.5 h-3.5 text-primary" />
              <p className="text-white/40 text-xs font-bold uppercase tracking-wider">Notas Internas KYC</p>
              <span className="text-white/20 text-xs ml-1">(nunca visíveis ao investidor)</span>
            </div>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
              placeholder="Ex: Confirmado via LinkedIn. Escritório em Pinheiros..."
              className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-white/70 text-sm placeholder-white/20 focus:outline-none focus:border-primary resize-none"
            />
            <button disabled={busy} onClick={() => act(() => onSaveNotes(candidato.id, notes))}
              className="mt-2 text-xs text-primary/70 hover:text-primary underline disabled:opacity-40">
              Salvar notas
            </button>
          </div>

          {(candidato.approvalStatus === "pending_kyc" || candidato.approvalStatus === "under_review") && (
            <div className="space-y-3">
              {candidato.approvalStatus === "pending_kyc" && (
                <button disabled={busy} onClick={() => act(() => onReview(candidato.id))}
                  className="w-full py-2.5 rounded-xl bg-blue-400/10 border border-blue-400/20 text-blue-400 text-sm font-bold hover:bg-blue-400/20 transition-colors disabled:opacity-40">
                  Mover para "Em Análise"
                </button>
              )}

              <div className="bg-green-400/5 border border-green-400/20 rounded-xl p-4 space-y-3">
                <p className="text-green-400 text-xs font-bold uppercase tracking-wider">Aprovar Investidor</p>
                <input value={approvedBy} onChange={e => setApprovedBy(e.target.value)}
                  placeholder="Seu nome (responsável pela aprovação) *"
                  className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-white/70 text-sm placeholder-white/20 focus:outline-none focus:border-green-400"
                />
                <input value={tempPwd} onChange={e => setTempPwd(e.target.value)}
                  placeholder="Senha inicial do portal (opcional)" type="password"
                  className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-white/70 text-sm placeholder-white/20 focus:outline-none focus:border-green-400"
                />
                <button
                  disabled={busy || !approvedBy.trim()}
                  onClick={() => act(() => onApprove(candidato.id, {
                    approvedBy: approvedBy.trim(),
                    kycNotes: notes || undefined,
                    temporaryPassword: tempPwd.trim() || undefined,
                  }))}
                  className="w-full py-2.5 rounded-xl bg-green-500 text-black text-sm font-black hover:bg-green-400 transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  {busy ? "Aprovando..." : "Liberar Acesso ao Portal"}
                </button>
              </div>

              <div className="bg-red-400/5 border border-red-400/20 rounded-xl p-4 space-y-3">
                <p className="text-red-400 text-xs font-bold uppercase tracking-wider">Reprovar / Suspender</p>
                <input value={rejectedReason} onChange={e => setRejectedReason(e.target.value)}
                  placeholder="Motivo da reprovação (opcional)"
                  className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-white/70 text-sm placeholder-white/20 focus:outline-none focus:border-red-400"
                />
                <button disabled={busy}
                  onClick={() => act(() => onReject(candidato.id, {
                    rejectedReason: rejectedReason || undefined,
                    kycNotes: notes || undefined,
                  }))}
                  className="w-full py-2.5 rounded-xl bg-red-400/10 border border-red-400/30 text-red-400 text-sm font-bold hover:bg-red-400/20 transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
                  <UserX className="w-4 h-4" />
                  {busy ? "Reprovando..." : "Reprovar Candidato"}
                </button>
              </div>
            </div>
          )}

          {candidato.approvalStatus === "approved" && (
            <div className="bg-background/60 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5 text-primary" />
                <p className="text-white/40 text-xs font-bold uppercase tracking-wider">Redefinir Senha</p>
              </div>
              <input value={newPwd} onChange={e => setNewPwd(e.target.value)}
                placeholder="Nova senha (mín. 8 caracteres)" type="password"
                className="w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-white/70 text-sm placeholder-white/20 focus:outline-none focus:border-primary"
              />
              <button disabled={busy || newPwd.length < 8}
                onClick={() => act(async () => {
                  await onResetPassword(candidato.id, newPwd);
                  setNewPwd("");
                  setMsg("Senha redefinida com sucesso.");
                })}
                className="py-2 px-4 rounded-xl bg-primary/10 border border-primary/30 text-primary text-sm font-bold hover:bg-primary/20 transition-colors disabled:opacity-40">
                {busy ? "Redefinindo..." : "Redefinir Senha"}
              </button>
            </div>
          )}

          {candidato.approvalStatus === "approved" && candidato.approvedBy && (
            <div className="text-xs text-green-400/60 bg-green-400/5 rounded-xl px-4 py-3">
              Aprovado por <strong>{candidato.approvedBy}</strong> em{" "}
              {candidato.approvedAt ? new Date(candidato.approvedAt).toLocaleDateString("pt-BR") : "—"}
            </div>
          )}
          {candidato.approvalStatus === "suspended" && candidato.rejectedReason && (
            <div className="text-xs text-red-400/60 bg-red-400/5 rounded-xl px-4 py-3">
              Motivo: <strong>{candidato.rejectedReason}</strong>
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

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<"password" | "totp">("password");
  const [preAuthToken, setPreAuthToken] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const totpRef = useRef<HTMLInputElement>(null);

  const handlePasswordSubmit = async () => {
    if (!password || busy) return;
    setBusy(true);
    setError("");
    try {
      const data = await adminRequest<{ token?: string; requireTotp?: boolean; preAuthToken?: string }>(
        "/admin/auth/login",
        { method: "POST", body: JSON.stringify({ password }) },
      );
      if (data.requireTotp && data.preAuthToken) {
        setPreAuthToken(data.preAuthToken);
        setStep("totp");
        setTimeout(() => totpRef.current?.focus(), 50);
      } else if (data.token) {
        localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
        onLogin();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao autenticar");
    } finally {
      setBusy(false);
    }
  };

  const isValidTotpInput = (v: string) => /^\d{6}$/.test(v) || /^[0-9A-F]{8}-[0-9A-F]{8}$/i.test(v.trim());

  const handleTotpSubmit = async () => {
    if (!isValidTotpInput(totpCode) || busy) return;
    setBusy(true);
    setError("");
    try {
      const data = await adminRequest<{ token: string }>("/admin/auth/2fa/verify", {
        method: "POST",
        body: JSON.stringify({ preAuthToken, totpCode }),
      });
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      onLogin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Código inválido");
      setTotpCode("");
      setTimeout(() => totpRef.current?.focus(), 50);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            {step === "totp" ? <Smartphone className="w-8 h-8 text-primary" /> : <Lock className="w-8 h-8 text-primary" />}
          </div>
          <h1 className="text-2xl font-black text-white">Painel Admin</h1>
          <p className="text-white/40 mt-1 text-sm">
            {step === "totp" ? "Verificação em dois fatores" : "VaideVan — Acesso restrito"}
          </p>
        </div>

        <div className="bg-card border border-white/10 rounded-2xl p-6 space-y-4">
          {step === "password" ? (
            <>
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">
                  Senha de Administrador
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handlePasswordSubmit()}
                  placeholder="Digite a senha de admin"
                  autoFocus
                  autoComplete="current-password"
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-primary text-sm"
                />
              </div>
              {error && (
                <p className="text-red-400 text-xs bg-red-400/10 rounded-xl px-3 py-2">{error}</p>
              )}
              <button
                type="button"
                onClick={handlePasswordSubmit}
                disabled={busy || !password}
                className="w-full py-3 rounded-xl bg-primary text-black font-black hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {busy ? "Verificando..." : "Continuar"}
              </button>
            </>
          ) : (
            <>
              <p className="text-white/50 text-sm text-center">
                Insira o código de 6 dígitos do seu app autenticador ou um código de recuperação.
              </p>
              <div>
                <label className="block text-xs font-bold text-white/40 uppercase tracking-wider mb-2">
                  Código 2FA ou Código de Recuperação
                </label>
                <input
                  ref={totpRef}
                  type="text"
                  inputMode="text"
                  maxLength={17}
                  value={totpCode}
                  onChange={e => setTotpCode(e.target.value.slice(0, 17))}
                  onKeyDown={e => e.key === "Enter" && handleTotpSubmit()}
                  placeholder="000000 ou XXXXXXXX-XXXXXXXX"
                  autoComplete="one-time-code"
                  className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-primary text-sm text-center tracking-widest font-mono"
                />
              </div>
              {error && (
                <p className="text-red-400 text-xs bg-red-400/10 rounded-xl px-3 py-2">{error}</p>
              )}
              <button
                type="button"
                onClick={handleTotpSubmit}
                disabled={busy || !isValidTotpInput(totpCode)}
                className="w-full py-3 rounded-xl bg-primary text-black font-black hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {busy ? "Verificando..." : "Confirmar"}
              </button>
              <button
                type="button"
                onClick={() => { setStep("password"); setError(""); setTotpCode(""); }}
                className="w-full text-xs text-white/30 hover:text-white/60 transition-colors"
              >
                ← Voltar
              </button>
            </>
          )}
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          Esta área é exclusiva para administradores da VaideVan.
        </p>
      </div>
    </div>
  );
}

type TwoFAStep = "idle" | "loading" | "show-qr" | "verify" | "backup-codes" | "done" | "disable";

function TwoFAModal({ onClose }: { onClose: () => void }) {
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [step, setStep] = useState<TwoFAStep>("loading");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    adminRequest<{ configured: boolean }>("/admin/auth/2fa/status")
      .then(d => {
        setConfigured(d.configured);
        setStep("idle");
      })
      .catch(() => setStep("idle"));
  }, []);

  const startSetup = async () => {
    setBusy(true);
    setError("");
    try {
      const d = await adminRequest<{ secret: string; qrCodeDataUrl: string }>("/admin/auth/2fa/setup");
      setSecret(d.secret);
      setQrDataUrl(d.qrCodeDataUrl);
      setStep("show-qr");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao gerar QR code");
    } finally {
      setBusy(false);
    }
  };

  const enableTotp = async () => {
    if (code.length !== 6 || busy) return;
    setBusy(true);
    setError("");
    try {
      const resp = await adminRequest<{ ok: boolean; backupCodes?: string[] }>("/admin/auth/2fa/enable", {
        method: "POST",
        body: JSON.stringify({ secret, totpCode: code }),
      });
      setConfigured(true);
      if (resp.backupCodes && resp.backupCodes.length > 0) {
        setBackupCodes(resp.backupCodes);
        setStep("backup-codes");
      } else {
        setSuccessMsg("2FA ativado com sucesso! Próximo login exigirá o código.");
        setStep("done");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Código inválido");
      setCode("");
    } finally {
      setBusy(false);
    }
  };

  const copyAllCodes = () => {
    const text = backupCodes.join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const downloadCodes = () => {
    const text = [
      "VaideVan Admin — Códigos de Recuperação 2FA",
      "Gerado em: " + new Date().toLocaleString("pt-BR"),
      "",
      "Cada código pode ser usado apenas UMA VEZ.",
      "Guarde em local seguro e privado.",
      "",
      ...backupCodes,
    ].join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vaidevan-2fa-backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const disableTotp = async () => {
    if (code.length !== 6 || !disablePassword || busy) return;
    setBusy(true);
    setError("");
    try {
      await adminRequest("/admin/auth/2fa/disable", {
        method: "POST",
        body: JSON.stringify({ totpCode: code, password: disablePassword }),
      });
      setConfigured(false);
      setSuccessMsg("2FA desativado.");
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Credenciais inválidas");
      setCode("");
      setDisablePassword("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-card border border-white/10 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            <h2 className="text-white font-black">Autenticação em Dois Fatores</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {step === "loading" && (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {step === "idle" && (
            <>
              <div className={`flex items-center gap-3 rounded-xl px-4 py-3 ${configured ? "bg-green-400/10 border border-green-400/20" : "bg-white/5 border border-white/10"}`}>
                {configured
                  ? <><CheckCircle className="w-5 h-5 text-green-400 shrink-0" /><div><p className="text-green-400 font-bold text-sm">2FA Ativado</p><p className="text-green-300/60 text-xs">Login exige código do autenticador</p></div></>
                  : <><Smartphone className="w-5 h-5 text-white/30 shrink-0" /><div><p className="text-white/60 font-bold text-sm">2FA não configurado</p><p className="text-white/30 text-xs">Login protegido apenas por senha</p></div></>
                }
              </div>
              {!configured ? (
                <button onClick={startSetup} disabled={busy}
                  className="w-full py-3 rounded-xl bg-primary text-black font-black hover:opacity-90 transition-opacity disabled:opacity-40">
                  {busy ? "Gerando..." : "Configurar 2FA"}
                </button>
              ) : (
                <button onClick={() => { setStep("disable"); setCode(""); setError(""); }}
                  className="w-full py-3 rounded-xl bg-red-400/10 border border-red-400/20 text-red-400 font-bold hover:bg-red-400/20 transition-colors flex items-center justify-center gap-2">
                  <Trash2 className="w-4 h-4" />Desativar 2FA
                </button>
              )}
              {error && <p className="text-red-400 text-xs bg-red-400/10 rounded-xl px-3 py-2">{error}</p>}
            </>
          )}

          {step === "show-qr" && (
            <>
              <p className="text-white/60 text-sm">Escaneie o QR code com o Google Authenticator, Authy ou outro app TOTP:</p>
              <div className="flex justify-center">
                <img src={qrDataUrl} alt="QR Code 2FA" className="w-48 h-48 rounded-xl bg-white p-2" />
              </div>
              <div className="bg-background/60 border border-white/10 rounded-xl px-4 py-3">
                <p className="text-white/30 text-xs mb-1">Ou insira a chave manualmente:</p>
                <p className="text-white/80 font-mono text-sm break-all">{secret}</p>
              </div>
              <p className="text-white/50 text-xs">Após escanear, insira o código de 6 dígitos para confirmar:</p>
              <input
                type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6}
                value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyDown={e => e.key === "Enter" && enableTotp()}
                placeholder="000000" autoFocus
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white text-center tracking-[0.4em] font-mono text-lg placeholder-white/20 focus:outline-none focus:border-primary"
              />
              {error && <p className="text-red-400 text-xs bg-red-400/10 rounded-xl px-3 py-2">{error}</p>}
              <button onClick={enableTotp} disabled={busy || code.length !== 6}
                className="w-full py-3 rounded-xl bg-primary text-black font-black hover:opacity-90 transition-opacity disabled:opacity-40">
                {busy ? "Ativando..." : "Ativar 2FA"}
              </button>
            </>
          )}

          {step === "backup-codes" && (
            <>
              <div className="flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-xl px-4 py-3">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <p className="text-amber-400 font-bold text-sm">Guarde seus códigos de recuperação</p>
                  <p className="text-amber-300/70 text-xs">Cada código é válido uma única vez. Se perder o autenticador, use um desses códigos para entrar.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((c) => (
                  <div key={c} className="bg-background border border-white/10 rounded-lg px-3 py-2 text-center font-mono text-sm text-white/90 tracking-wider">
                    {c}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={copyAllCodes}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/10 text-white text-sm font-bold hover:bg-white/20 transition-colors">
                  <Copy className="w-4 h-4" />
                  {copied ? "Copiado!" : "Copiar todos"}
                </button>
                <button onClick={downloadCodes}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/10 text-white text-sm font-bold hover:bg-white/20 transition-colors">
                  <Download className="w-4 h-4" />
                  Baixar .txt
                </button>
              </div>
              <button
                onClick={() => { setSuccessMsg("2FA ativado com sucesso! Próximo login exigirá o código."); setStep("done"); }}
                className="w-full py-3 rounded-xl bg-primary text-black font-black hover:opacity-90 transition-opacity">
                Salvei meus códigos — Continuar
              </button>
            </>
          )}

          {step === "disable" && (
            <>
              <div className="bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                <p className="text-red-400 text-xs font-bold">Atenção: esta ação removerá a proteção extra da sua conta.</p>
              </div>
              <p className="text-white/60 text-sm">Insira sua senha de administrador para confirmar:</p>
              <input
                type="password"
                value={disablePassword} onChange={e => setDisablePassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && disableTotp()}
                placeholder="Senha de administrador" autoFocus
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-red-400"
              />
              <p className="text-white/60 text-sm">E o código atual do seu app autenticador:</p>
              <input
                type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6}
                value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyDown={e => e.key === "Enter" && disableTotp()}
                placeholder="000000"
                className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-white text-center tracking-[0.4em] font-mono text-lg placeholder-white/20 focus:outline-none focus:border-red-400"
              />
              {error && <p className="text-red-400 text-xs bg-red-400/10 rounded-xl px-3 py-2">{error}</p>}
              <button onClick={disableTotp} disabled={busy || code.length !== 6 || !disablePassword}
                className="w-full py-3 rounded-xl bg-red-500 text-white font-black hover:opacity-90 transition-opacity disabled:opacity-40">
                {busy ? "Desativando..." : "Confirmar Desativação"}
              </button>
              <button onClick={() => { setStep("idle"); setCode(""); setDisablePassword(""); setError(""); }}
                className="w-full text-xs text-white/30 hover:text-white/60 transition-colors">
                ← Voltar
              </button>
            </>
          )}

          {step === "done" && (
            <div className="text-center py-4 space-y-3">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto" />
              <p className="text-green-400 font-bold">{successMsg}</p>
              <button onClick={onClose}
                className="mt-2 px-6 py-2 rounded-xl bg-white/10 text-white text-sm hover:bg-white/20 transition-colors">
                Fechar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface AuditLogEntry {
  id: number;
  ip: string;
  userAgent: string | null;
  outcome: string;
  totpVerified: boolean | null;
  createdAt: string;
}

export default function AdminPanel() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("todos");
  const [search, setSearch] = useState("");
  const [show2FA, setShow2FA] = useState(false);
  const [lastLogin, setLastLogin] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    const token = getAdminToken();
    if (!token) { setAuthed(false); return; }
    try {
      await adminRequest("/admin/auth/verify");
      setAuthed(true);
    } catch {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      setAuthed(false);
    }
  }, []);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  useEffect(() => {
    if (!authed) return;
    adminRequest<AuditLogEntry[]>("/admin/auth/audit-log")
      .then(entries => {
        const successOutcomes = ["password_ok", "totp_ok"];
        const lastSuccess = entries.find(e => successOutcomes.includes(e.outcome));
        if (lastSuccess) setLastLogin(lastSuccess.createdAt);
      })
      .catch(() => {});
  }, [authed]);

  const loadCandidatos = useCallback(() => {
    setLoading(true);
    adminRequest<Candidato[]>("/admin/investor-applications")
      .then(setCandidatos)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (authed) loadCandidatos();
  }, [authed, loadCandidatos]);

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setAuthed(false);
    setCandidatos([]);
  };

  const handleReview = async (id: number) => {
    await adminRequest(`/admin/investor-applications/${id}/review`, { method: "PATCH" });
    setCandidatos(cs => cs.map(c => c.id === id ? { ...c, approvalStatus: "under_review" } : c));
  };

  const handleApprove = async (id: number, data: { approvedBy: string; kycNotes?: string; temporaryPassword?: string }) => {
    const result = await adminRequest<{ message: string }>(`/admin/investor-applications/${id}/approve`, {
      method: "PATCH", body: JSON.stringify(data),
    });
    setCandidatos(cs => cs.map(c => c.id === id
      ? { ...c, approvalStatus: "approved", approvedBy: data.approvedBy, approvedAt: new Date().toISOString() }
      : c));
    alert(`✅ ${result.message}`);
  };

  const handleReject = async (id: number, data: { rejectedReason?: string; kycNotes?: string }) => {
    await adminRequest(`/admin/investor-applications/${id}/reject`, { method: "PATCH", body: JSON.stringify(data) });
    setCandidatos(cs => cs.map(c => c.id === id
      ? { ...c, approvalStatus: "suspended", rejectedReason: data.rejectedReason || null }
      : c));
  };

  const handleSaveNotes = async (id: number, kycNotes: string) => {
    await adminRequest(`/admin/investor-applications/${id}/notes`, { method: "PATCH", body: JSON.stringify({ kycNotes }) });
    setCandidatos(cs => cs.map(c => c.id === id ? { ...c, kycNotes } : c));
  };

  const handleResetPassword = async (id: number, newPassword: string) => {
    await adminRequest(`/admin/investor-applications/${id}/reset-password`, {
      method: "PATCH", body: JSON.stringify({ newPassword }),
    });
  };

  if (authed === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authed) {
    return <LoginScreen onLogin={() => { setAuthed(true); }} />;
  }

  const counts = {
    todos: candidatos.length,
    pending_kyc: candidatos.filter(c => c.approvalStatus === "pending_kyc").length,
    under_review: candidatos.filter(c => c.approvalStatus === "under_review").length,
    approved: candidatos.filter(c => c.approvalStatus === "approved").length,
    suspended: candidatos.filter(c => c.approvalStatus === "suspended").length,
  };

  const q = search.toLowerCase().trim();
  const filtered = candidatos
    .filter(c => filter === "todos" || c.approvalStatus === filter)
    .filter(c => !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.phone ?? "").includes(q))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="min-h-screen bg-background">
      {show2FA && <TwoFAModal onClose={() => setShow2FA(false)} />}
      <div className="border-b border-white/10 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-white font-black text-lg leading-none">Painel Admin</h1>
              {lastLogin ? (
                <p className="text-white/30 text-xs flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Último acesso: {new Date(lastLogin).toLocaleString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              ) : (
                <p className="text-white/30 text-xs">VaideVan — Aprovação de Investidores</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadCandidatos} disabled={loading}
              className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all disabled:opacity-40">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={() => setShow2FA(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all text-sm"
              title="Configurar autenticação em dois fatores">
              <Smartphone className="w-3.5 h-3.5" />2FA
            </button>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all text-sm">
              <LogOut className="w-3.5 h-3.5" />Sair
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-5">
          {[
            { key: "todos",        label: "Total",       count: counts.todos,        cls: "text-white",      border: "border-white/10" },
            { key: "pending_kyc",  label: "Aguardando",  count: counts.pending_kyc,  cls: "text-yellow-400", border: "border-yellow-400/20" },
            { key: "under_review", label: "Em análise",  count: counts.under_review, cls: "text-blue-400",   border: "border-blue-400/20" },
            { key: "approved",     label: "Aprovados",   count: counts.approved,     cls: "text-green-400",  border: "border-green-400/20" },
            { key: "suspended",    label: "Suspensos",   count: counts.suspended,    cls: "text-red-400",    border: "border-red-400/20" },
          ].map(s => (
            <button key={s.key} onClick={() => setFilter(s.key)}
              className={`bg-card border ${s.border} rounded-xl p-3 text-left transition-all ${filter === s.key ? "ring-2 ring-primary/40" : "hover:border-white/20"}`}>
              <p className="text-white/40 text-xs">{s.label}</p>
              <p className={`text-xl font-black ${s.cls}`}>{s.count}</p>
            </button>
          ))}
        </div>

        <div className="mb-5">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome, e-mail ou telefone..."
            className="w-full bg-card border border-white/10 rounded-xl px-4 py-3 text-white/80 text-sm placeholder-white/20 focus:outline-none focus:border-primary"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Nenhum candidato encontrado.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(c => (
              <CandidatoCard key={c.id} candidato={c}
                onReview={handleReview}
                onApprove={handleApprove}
                onReject={handleReject}
                onSaveNotes={handleSaveNotes}
                onResetPassword={handleResetPassword}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
