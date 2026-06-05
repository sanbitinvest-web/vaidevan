import { useEffect, useState, useCallback } from "react";
import { Link } from "wouter";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import {
  TrendingUp, Car, FileText, Building2, ArrowRight, TrendingDown,
  ShieldCheck, AlertTriangle, Clock, CheckCircle2, Fingerprint,
  FolderOpen, Navigation, FileSignature, Users, Eye, X, UserPlus,
  User, Briefcase, RefreshCw, Scale,
} from "lucide-react";

type QuickClientForm = { type: string; name: string; email: string; phone: string; cpf: string; cnpj: string; notes: string };
const EMPTY_CLIENT: QuickClientForm = { type: "pessoa_fisica", name: "", email: "", phone: "", cpf: "", cnpj: "", notes: "" };

function QuickClientModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState<QuickClientForm>(EMPTY_CLIENT);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const f = (k: keyof QuickClientForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const inp = "w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-primary/50 transition-colors";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) { setError("Nome e e-mail são obrigatórios"); return; }
    setSaving(true); setError("");
    try {
      await api.createClient({ ...EMPTY_CLIENT, ...form } as any);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cadastrar cliente");
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-card border border-white/10 rounded-3xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            <h2 className="font-black text-white text-lg">Cadastrar Cliente</h2>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          {error && <p className="text-red-400 text-sm bg-red-400/10 rounded-xl px-4 py-2">{error}</p>}

          <div className="flex gap-2">
            {[
              { val: "pessoa_fisica",   label: "Pessoa Física",   Icon: User },
              { val: "pessoa_juridica", label: "Pessoa Jurídica", Icon: Briefcase },
            ].map(({ val, label, Icon }) => (
              <button key={val} type="button" onClick={() => setForm(p => ({ ...p, type: val }))}
                className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-xl border text-sm font-bold transition-all ${form.type === val ? "border-primary bg-primary/10 text-primary" : "border-white/10 text-white/50 hover:border-white/20"}`}>
                <Icon className="w-4 h-4" />{label}
              </button>
            ))}
          </div>

          <div>
            <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1 block">Nome Completo *</label>
            <input className={inp} value={form.name} onChange={f("name")} placeholder="Nome completo ou razão social" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1 block">E-mail *</label>
              <input className={inp} type="email" value={form.email} onChange={f("email")} placeholder="email@exemplo.com" required />
            </div>
            <div>
              <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1 block">WhatsApp</label>
              <input className={inp} value={form.phone} onChange={f("phone")} placeholder="(11) 99999-9999" />
            </div>
          </div>
          <div>
            <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1 block">
              {form.type === "pessoa_fisica" ? "CPF" : "CNPJ"}
            </label>
            {form.type === "pessoa_fisica"
              ? <input className={inp} value={form.cpf} onChange={f("cpf")} placeholder="000.000.000-00" />
              : <input className={inp} value={form.cnpj} onChange={f("cnpj")} placeholder="00.000.000/0001-00" />}
          </div>
          <div>
            <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1 block">Observações</label>
            <textarea className={`${inp} resize-none`} rows={2} value={form.notes} onChange={f("notes")} placeholder="Anotações internas..." />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 h-11 rounded-full border border-white/20 text-white/70 hover:border-white/40 transition text-sm font-semibold">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 h-11 rounded-full bg-primary text-black font-black hover:bg-primary/90 transition disabled:opacity-40 text-sm">
              {saving ? "Salvando..." : "Cadastrar Cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function fmt(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function ContractStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; Icon: React.ElementType }> = {
    pending:   { label: "Aguardando assinatura", cls: "text-yellow-400 bg-yellow-400/10", Icon: Clock },
    signed:    { label: "Assinado",              cls: "text-green-400  bg-green-400/10",  Icon: CheckCircle2 },
    cancelled: { label: "Cancelado",             cls: "text-red-400    bg-red-400/10",    Icon: AlertTriangle },
  };
  const s = map[status] ?? map.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-bold rounded-full px-3 py-1 ${s.cls}`}>
      <s.Icon className="w-3 h-3" />{s.label}
    </span>
  );
}

function DocStatusBadge({ status }: { status: string }) {
  if (status === "aprovado") return <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">Aprovado</span>;
  if (status === "rejeitado") return <span className="text-xs font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">Rejeitado</span>;
  return <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">Pendente</span>;
}

type DashboardData = Awaited<ReturnType<typeof api.dashboard>>;

export default function Dashboard() {
  const { investor } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [clientSavedMsg, setClientSavedMsg] = useState(false);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const result = await api.dashboard();
      setData(result);
      setLastUpdated(new Date());
    } catch {
      // silencioso em segundo plano
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData(false);
    // Atualização a cada 5 minutos — dados do dashboard não mudam em tempo real
    const interval = setInterval(() => fetchData(true), 300_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const overview  = data?.overview ?? null;
  const profile   = data?.profile  ?? null;
  const contracts = data?.contracts ?? [];

  const monthlyData = data?.monthly
    ? Object.entries(data.monthly)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([month, d]) => ({
          mes: new Date(month + "-01").toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
          Receita: d.income,
          Despesa: d.expense,
          Resultado: d.income - d.expense,
        }))
    : [];

  const stats = overview
    ? [
        { label: "Operações Ativas",  value: overview.operations,    icon: Building2,  color: "text-blue-400",   bg: "bg-blue-400/10" },
        { label: "Veículos em Frota", value: overview.vehicles,       icon: Car,        color: "text-green-400",  bg: "bg-green-400/10" },
        { label: "Contratos Ativos",  value: contracts.filter(c => c.status !== "cancelled").length, icon: FileText, color: "text-yellow-400", bg: "bg-yellow-400/10" },
        { label: "Resultado Líquido", value: fmt(overview.netResult), icon: overview.netResult >= 0 ? TrendingUp : TrendingDown, color: "text-primary", bg: "bg-primary/10" },
      ]
    : [];

  const pendingContracts = contracts.filter(c => c.status === "pending");
  const signedContracts  = contracts.filter(c => c.status === "signed");

  const faceIdVerified = profile?.govBrVerified ?? false;
  const cnhOk   = profile?.cnhStatus === "aprovado";
  const proofOk = profile?.addressProofStatus === "aprovado";
  const kycComplete = faceIdVerified && cnhOk && proofOk;

  return (
    <DashboardLayout>
      {showClientModal && (
        <QuickClientModal
          onClose={() => setShowClientModal(false)}
          onSaved={() => { setClientSavedMsg(true); setTimeout(() => setClientSavedMsg(false), 3000); }}
        />
      )}
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {clientSavedMsg && (
          <div className="mb-4 flex items-center gap-2 bg-green-400/10 border border-green-400/20 text-green-400 rounded-xl px-4 py-3 text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4" /> Cliente cadastrado com sucesso!
          </div>
        )}

        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-white">
              Olá, {investor?.name?.split(" ")[0]} 👋
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-white/50">Resumo das suas operações — VaideVan Executivo</p>
              {lastUpdated && (
                <span className="text-white/25 text-xs hidden sm:inline">
                  Atualizado {lastUpdated.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchData(false)}
              disabled={refreshing}
              title="Atualizar dados"
              className="w-9 h-9 rounded-xl border border-white/10 bg-card flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all disabled:opacity-40"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
            {!kycComplete && (
              <Link href="/portal/perfil">
                <div className="hidden md:flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 rounded-xl px-4 py-2 cursor-pointer hover:bg-yellow-400/15 transition-all">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 text-xs font-bold">Verificação KYC pendente</span>
                  <ArrowRight className="w-3 h-3 text-yellow-400" />
                </div>
              </Link>
            )}
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-card rounded-2xl animate-pulse" />)}
            </div>
            <div className="h-64 bg-card rounded-2xl animate-pulse" />
          </div>
        ) : (
          <>
            {/* Stats KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {stats.map((s, i) => (
                <div key={i} className="bg-card border border-white/10 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white/50 text-xs font-medium uppercase tracking-wide">{s.label}</p>
                    <div className={`w-8 h-8 ${s.bg} rounded-lg flex items-center justify-center`}>
                      <s.icon className={`w-4 h-4 ${s.color}`} />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-white">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Resultado financeiro */}
            {overview && (
            <div className="grid lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-card border border-white/10 rounded-2xl p-5">
                <p className="text-white/40 text-xs uppercase tracking-wide mb-1">Total de Receitas</p>
                <p className="text-2xl font-black text-green-400">{fmt(overview.totalIncome)}</p>
              </div>
              <div className="bg-card border border-white/10 rounded-2xl p-5">
                <p className="text-white/40 text-xs uppercase tracking-wide mb-1">Total de Despesas</p>
                <p className="text-2xl font-black text-red-400">{fmt(overview.totalExpense)}</p>
              </div>
              <div className="bg-card border border-primary/30 rounded-2xl p-5 bg-primary/5">
                <p className="text-white/40 text-xs uppercase tracking-wide mb-1">Resultado Acumulado</p>
                <p className="text-2xl font-black text-primary">{fmt(overview.netResult)}</p>
              </div>
            </div>
            )}

            {/* Gráfico + Verificação KYC / Face ID */}
            <div className="grid lg:grid-cols-3 gap-4 mb-6">
              {/* Gráfico mensal */}
              <div className="lg:col-span-2 bg-card border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-black text-white text-sm uppercase tracking-wide">Receitas × Despesas — Últimos 6 meses</h2>
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-green-500 inline-block" />Receita</span>
                    <span className="flex items-center gap-1.5 text-white/50"><span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" />Despesa</span>
                    <span className="flex items-center gap-1.5 text-primary"><span className="w-2.5 h-0.5 bg-primary inline-block" /><span className="w-1.5 h-1.5 rounded-full bg-primary inline-block -ml-1" />Resultado</span>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={240}>
                  <ComposedChart data={monthlyData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} syncId="dashboard-charts">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis
                      dataKey="mes"
                      stroke="rgba(255,255,255,0.0)"
                      tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="rgba(255,255,255,0.0)"
                      tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`}
                      width={48}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(255,255,255,0.03)" }}
                      contentStyle={{
                        background: "#0f0f0f",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: 12,
                        padding: "10px 14px",
                        fontSize: 12,
                      }}
                      labelStyle={{ color: "rgba(255,255,255,0.5)", fontWeight: 700, marginBottom: 6, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}
                      formatter={(value: number, name: string) => [fmt(value), name]}
                      itemStyle={{ color: "#fff", fontWeight: 600, padding: "2px 0" }}
                    />
                    <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 2" />
                    <Bar dataKey="Receita" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="Despesa" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={28} />
                    <Line
                      dataKey="Resultado"
                      type="monotone"
                      stroke="#F5E642"
                      strokeWidth={2.5}
                      dot={{ fill: "#F5E642", r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: "#F5E642", strokeWidth: 2, stroke: "#0A0A0A" }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Verificação de identidade */}
              <div className="bg-card border border-white/10 rounded-2xl p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-5">
                  <Fingerprint className="w-5 h-5 text-primary" />
                  <h2 className="font-black text-white text-sm uppercase tracking-wide">Verificação de Identidade</h2>
                </div>
                <div className="space-y-3 flex-1">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-white/10">
                    <div className="flex items-center gap-2">
                      <Fingerprint className="w-4 h-4 text-white/40" />
                      <span className="text-white text-sm font-semibold">Face ID / Gov.BR</span>
                    </div>
                    {faceIdVerified
                      ? <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">Verificado</span>
                      : <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">Pendente</span>
                    }
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-white/10">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-white/40" />
                      <span className="text-white text-sm font-semibold">CNH</span>
                    </div>
                    <DocStatusBadge status={profile?.cnhStatus ?? "pendente"} />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-white/10">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-4 h-4 text-white/40" />
                      <span className="text-white text-sm font-semibold">Comprovante de Endereço</span>
                    </div>
                    <DocStatusBadge status={profile?.addressProofStatus ?? "pendente"} />
                  </div>
                </div>
                <Link href="/portal/perfil">
                  <button className="mt-5 w-full py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/30 text-sm font-semibold transition-all flex items-center justify-center gap-2">
                    {kycComplete ? <><CheckCircle2 className="w-4 h-4 text-green-400" /> KYC Completo</> : <><AlertTriangle className="w-4 h-4 text-yellow-400" /> Completar verificação</>}
                  </button>
                </Link>
              </div>
            </div>

            {/* Contratos pendentes de assinatura */}
            {pendingContracts.length > 0 && (
              <div className="bg-card border border-yellow-400/20 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileSignature className="w-5 h-5 text-yellow-400" />
                    <h2 className="font-black text-white text-sm uppercase tracking-wide">
                      Contratos Aguardando Assinatura ({pendingContracts.length})
                    </h2>
                  </div>
                  <Link href="/portal/contratos">
                    <button className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                      Ver todos <ArrowRight className="w-3 h-3" />
                    </button>
                  </Link>
                </div>
                <div className="space-y-3">
                  {pendingContracts.slice(0, 3).map(c => (
                    <div key={c.id} className="flex items-center justify-between p-4 rounded-xl bg-background border border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-yellow-400/10 rounded-lg flex items-center justify-center">
                          <FileText className="w-4 h-4 text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-white text-sm font-bold">{c.title}</p>
                          <p className="text-white/40 text-xs mt-0.5">{new Date(c.createdAt).toLocaleDateString("pt-BR")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <ContractStatusBadge status={c.status} />
                        <Link href="/portal/contratos">
                          <button className="w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-all">
                            <Eye className="w-4 h-4 text-primary" />
                          </button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contratos assinados recentes */}
            {signedContracts.length > 0 && (
              <div className="bg-card border border-white/10 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-green-400" />
                    <h2 className="font-black text-white text-sm uppercase tracking-wide">
                      Contratos Assinados ({signedContracts.length})
                    </h2>
                  </div>
                  <Link href="/portal/contratos">
                    <button className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
                      Ver todos <ArrowRight className="w-3 h-3" />
                    </button>
                  </Link>
                </div>
                <div className="space-y-2">
                  {signedContracts.slice(0, 2).map(c => (
                    <div key={c.id} className="flex items-center justify-between p-3 rounded-xl bg-background border border-white/10">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span className="text-white text-sm font-semibold">{c.title}</span>
                      </div>
                      <ContractStatusBadge status={c.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cadastro rápido de cliente */}
            <div className="bg-card border border-primary/20 rounded-2xl p-5 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Cadastrar Cliente</p>
                  <p className="text-white/40 text-xs">Registre um novo cliente rapidamente</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/portal/clientes">
                  <button className="text-xs text-white/50 font-semibold hover:text-white transition flex items-center gap-1">
                    Ver todos <ArrowRight className="w-3 h-3" />
                  </button>
                </Link>
                <button
                  onClick={() => setShowClientModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-black font-black text-sm rounded-xl hover:bg-primary/90 transition"
                >
                  <UserPlus className="w-4 h-4" /> Novo Cliente
                </button>
              </div>
            </div>

            {/* Acesso rápido */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  href: "/portal/rastreamento",
                  icon: Navigation,
                  color: "text-blue-400",
                  bg: "bg-blue-400/10",
                  label: "Rastreamento GPS",
                  sub: `${overview?.activeVehicles ?? 0} veículos ativos`,
                },
                {
                  href: "/portal/contratos",
                  icon: FileText,
                  color: "text-primary",
                  bg: "bg-primary/10",
                  label: "Contratos",
                  sub: `${pendingContracts.length} pendente${pendingContracts.length !== 1 ? "s" : ""}`,
                },
                {
                  href: "/portal/documentos",
                  icon: FolderOpen,
                  color: "text-purple-400",
                  bg: "bg-purple-400/10",
                  label: "Documentos",
                  sub: kycComplete ? "KYC completo" : "Enviar documentos",
                },
                {
                  href: "/portal/candidatos",
                  icon: Users,
                  color: "text-orange-400",
                  bg: "bg-orange-400/10",
                  label: "Candidatos",
                  sub: "Filtrar investidores",
                },
                {
                  href: "/portal/juridico",
                  icon: Scale,
                  color: "text-green-400",
                  bg: "bg-green-400/10",
                  label: "Amparo Jurídico",
                  sub: "Lei 10.406/02 · TJMG",
                },
              ].map(item => (
                <Link key={item.href} href={item.href}>
                  <div className="bg-card border border-white/10 hover:border-primary/40 rounded-2xl p-5 flex items-center justify-between cursor-pointer transition-all group">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center`}>
                        <item.icon className={`w-5 h-5 ${item.color}`} />
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{item.label}</p>
                        <p className="text-white/40 text-xs">{item.sub}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
