import { useState, useMemo, useCallback, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Legend,
} from "recharts";
import {
  TrendingUp, DollarSign, Calendar, Target, ChevronDown, ChevronUp,
  MessageCircle, Save, CheckCircle2, RefreshCcw, Info, Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ─── Modalidades ────────────────────────────────────────────────────────────
const MODALITIES = [
  {
    id: "cota_inicial",
    label: "Cota Inicial",
    emoji: "🎯",
    color: "#22d3ee",
    minAmount: 20000,
    rates: { pessimist: 0.22, realist: 0.28, optimist: 0.35 },
    desc: "Ideal para estrear no mercado de transporte executivo",
    badge: "Entrada",
  },
  {
    id: "cota_parceria",
    label: "Cota Parceria",
    emoji: "🤝",
    color: "#4ade80",
    minAmount: 50000,
    rates: { pessimist: 0.28, realist: 0.33, optimist: 0.42 },
    desc: "Retorno consistente com participação na frota operacional",
    badge: "Popular",
  },
  {
    id: "cota_executiva",
    label: "Cota Executiva",
    emoji: "⭐",
    color: "#a78bfa",
    minAmount: 100000,
    rates: { pessimist: 0.33, realist: 0.42, optimist: 0.52 },
    desc: "Alta rentabilidade com diversificação em múltiplos veículos",
    badge: "Destaque",
  },
  {
    id: "cota_master",
    label: "Cota Master",
    emoji: "👑",
    color: "#F5E642",
    minAmount: 200000,
    rates: { pessimist: 0.40, realist: 0.55, optimist: 0.68 },
    desc: "Máxima rentabilidade — acesso exclusivo à frota premium",
    badge: "Top Tier",
  },
  {
    id: "terceirize_frota",
    label: "Terceirize sua Frota",
    emoji: "🚐",
    color: "#fb923c",
    minAmount: 116000,
    rates: { pessimist: 0.28, realist: 0.38, optimist: 0.48 },
    desc: "Você tem a van, a VaideVan opera e paga mensalmente",
    badge: "Frota Própria",
  },
  {
    id: "van_familia_flex",
    label: "Van Família Flex",
    emoji: "🏠",
    color: "#f472b6",
    minAmount: 60000,
    rates: { pessimist: 0.15, realist: 0.22, optimist: 0.30 },
    desc: "Use quando precisar, monetize os dias ociosos restantes",
    badge: "Flex",
  },
];

const HORIZONS = [12, 24, 36, 48, 60];

// ─── Cálculos ───────────────────────────────────────────────────────────────
function calcSim(amount: number, months: number, annualRate: number) {
  const monthly = annualRate / 12;
  const data: { month: number; cumulative: number; monthly: number }[] = [];
  for (let m = 0; m <= months; m++) {
    data.push({
      month: m,
      cumulative: parseFloat((m * amount * monthly).toFixed(2)),
      monthly: parseFloat((amount * monthly).toFixed(2)),
    });
  }
  const totalReturn = amount + data[months].cumulative;
  const roi = (data[months].cumulative / amount) * 100;
  const breakEven = Math.ceil(12 / annualRate);
  return { data, totalReturn, roi, breakEven, totalProfit: data[months].cumulative };
}

function buildChartData(amount: number, months: number, rates: { pessimist: number; realist: number; optimist: number }) {
  const p = calcSim(amount, months, rates.pessimist);
  const r = calcSim(amount, months, rates.realist);
  const o = calcSim(amount, months, rates.optimist);
  return {
    points: p.data.map((_, i) => ({
      mes: i,
      pessimist: p.data[i].cumulative,
      realist: r.data[i].cumulative,
      optimist: o.data[i].cumulative,
    })),
    pessimist: p,
    realist: r,
    optimist: o,
  };
}

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmtPct = (v: number) => `${v.toFixed(1)}%`;

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
function SimTooltip({ active, payload, label, amount }: {
  active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: number; amount: number;
}) {
  if (!active || !payload?.length) return null;
  const scenarios: Record<string, string> = { pessimist: "Conservador", realist: "Realista", optimist: "Otimista" };
  return (
    <div className="bg-card border border-white/20 rounded-xl p-4 text-sm shadow-2xl min-w-[220px]">
      <p className="text-white/60 font-semibold mb-3 text-xs uppercase tracking-wide">
        {label === 0 ? "Início" : `Mês ${label}`}
      </p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center justify-between gap-4 py-1">
          <span className="flex items-center gap-1.5 text-white/70">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
            {scenarios[p.name] || p.name}
          </span>
          <span className="font-black" style={{ color: p.color }}>
            {fmt(p.value)}
          </span>
        </div>
      ))}
      {(label || 0) > 0 && (
        <div className="mt-2 pt-2 border-t border-white/10 flex justify-between text-white/50 text-xs">
          <span>Break-even</span>
          <span>{amount <= (payload[1]?.value ?? 0) ? "✅ Atingido" : `falta ${fmt(amount - (payload[1]?.value ?? 0))}`}</span>
        </div>
      )}
    </div>
  );
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface SavedSimulation {
  id: number;
  modalityLabel: string | null;
  investmentAmount: string;
  months: number;
  realistReturn: string | null;
  realistYield: string | null;
  createdAt: string;
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function Simulador() {
  const { investor } = useAuth();
  const { toast } = useToast();
  const [modality, setModality] = useState(MODALITIES[0]);
  const [amount, setAmount] = useState(20000);
  const [months, setMonths] = useState(24);
  const [showTable, setShowTable] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [amountInput, setAmountInput] = useState("20000");
  const [history, setHistory] = useState<SavedSimulation[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("vdv_token");
    if (!token) return;
    const _ext = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? `${import.meta.env.BASE_URL.replace(/\/$/, "")}/api`;
    fetch(`${_ext}/investor/simulations`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : [])
      .then((data: SavedSimulation[]) => setHistory(data.slice(0, 5)))
      .catch(() => {});
  }, [saved]);

  const sim = useMemo(() => buildChartData(amount, months, modality.rates), [amount, months, modality]);

  const handleAmountChange = useCallback((val: string) => {
    setAmountInput(val);
    const n = parseFloat(val.replace(/\D/g, ""));
    if (!isNaN(n) && n >= 1000) setAmount(n);
  }, []);

  const handleModality = useCallback((m: typeof MODALITIES[0]) => {
    setModality(m);
    setSaved(false);
    if (amount < m.minAmount) {
      setAmount(m.minAmount);
      setAmountInput(String(m.minAmount));
    }
  }, [amount]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaved(false);
    try {
      const body = {
        modality: modality.id,
        modalityLabel: modality.label,
        investmentAmount: amount,
        months,
        pessimistReturn: sim.pessimist.totalReturn,
        realistReturn: sim.realist.totalReturn,
        optimistReturn: sim.optimist.totalReturn,
        pessimistYield: modality.rates.pessimist,
        realistYield: modality.rates.realist,
        optimistYield: modality.rates.optimist,
        breakEvenMonthPessimist: sim.pessimist.breakEven,
        breakEvenMonthRealist: sim.realist.breakEven,
        breakEvenMonthOptimist: sim.optimist.breakEven,
      };
      const token = localStorage.getItem("vdv_token");
      const __ext = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? `${import.meta.env.BASE_URL.replace(/\/$/, "")}/api`;
      const res = await fetch(`${__ext}/investor/simulations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setSaved(true);
        toast({
          title: "Simulação registrada!",
          description: "Nossos especialistas receberam seus dados e entrarão em contato.",
        });
      } else {
        throw new Error("Falha ao salvar");
      }
    } catch {
      toast({ title: "Erro ao salvar simulação", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }, [modality, amount, months, sim, toast]);

  const waMsg = encodeURIComponent(
    `Olá! Sou ${investor?.name || "investidor"} e fiz uma simulação no portal VaideVan:\n` +
    `• Modalidade: ${modality.label}\n` +
    `• Valor: ${fmt(amount)}\n` +
    `• Prazo: ${months} meses\n` +
    `• Retorno realista: ${fmt(sim.realist.totalReturn)} (+${fmtPct(sim.realist.roi)})\n\n` +
    `Gostaria de conversar sobre esse investimento.`
  );

  const breakEvenInRange = sim.realist.breakEven <= months;

  return (
    <DashboardLayout>
      <div className="min-h-screen p-6 md:p-8 max-w-7xl mx-auto space-y-8">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white mb-1">
              Simulador de Investimento
            </h1>
            <p className="text-white/50 text-sm md:text-base">
              Visualize projeções reais e salve sua simulação para análise personalizada.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-xl px-4 py-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-primary font-bold text-sm">Análise em tempo real</span>
          </div>
        </div>

        {/* ── Seletor de modalidade ── */}
        <div>
          <p className="text-white/50 text-xs uppercase tracking-widest font-semibold mb-3">
            1. Escolha a modalidade
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {MODALITIES.map(m => (
              <button
                key={m.id}
                onClick={() => handleModality(m)}
                className={`relative rounded-2xl p-4 text-left border transition-all duration-200 group ${
                  modality.id === m.id
                    ? "border-2 bg-white/5 shadow-lg"
                    : "border-white/10 bg-card hover:bg-white/5 hover:border-white/20"
                }`}
                style={modality.id === m.id ? { borderColor: m.color } : {}}
              >
                <span className="absolute -top-2 -right-1 text-[10px] font-black px-2 py-0.5 rounded-full"
                  style={{ background: m.color + "22", color: m.color, border: `1px solid ${m.color}44` }}>
                  {m.badge}
                </span>
                <div className="text-2xl mb-2">{m.emoji}</div>
                <div className="font-black text-white text-xs leading-tight mb-1">{m.label}</div>
                <div className="text-white/40 text-[10px] leading-snug mb-2 hidden md:block">{m.desc}</div>
                <div className="font-black text-xs" style={{ color: m.color }}>
                  {Math.round(m.rates.realist * 100)}% a.a.
                </div>
                <div className="text-white/30 text-[10px]">
                  Mín. {fmt(m.minAmount)}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Controles ── */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Amount */}
          <div className="rounded-2xl bg-card border border-white/10 p-6">
            <p className="text-white/50 text-xs uppercase tracking-widest font-semibold mb-4">
              2. Valor a investir
            </p>
            <div className="relative mb-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-bold text-sm">R$</span>
              <input
                type="text"
                value={amountInput}
                onChange={e => handleAmountChange(e.target.value)}
                className="w-full bg-black/30 border border-white/20 rounded-xl pl-12 pr-4 py-4 text-white text-xl font-black focus:outline-none focus:border-primary transition-colors"
                inputMode="numeric"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[modality.minAmount, modality.minAmount * 2, modality.minAmount * 5].map(v => (
                <button
                  key={v}
                  onClick={() => { setAmount(v); setAmountInput(String(v)); setSaved(false); }}
                  className={`rounded-xl py-2 text-xs font-bold transition-all ${
                    amount === v
                      ? "bg-primary text-black"
                      : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10"
                  }`}
                >
                  {fmt(v)}
                </button>
              ))}
            </div>
            {amount < modality.minAmount && (
              <p className="text-amber-400 text-xs flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                Mínimo para {modality.label}: {fmt(modality.minAmount)}
              </p>
            )}
          </div>

          {/* Horizon */}
          <div className="rounded-2xl bg-card border border-white/10 p-6">
            <p className="text-white/50 text-xs uppercase tracking-widest font-semibold mb-4">
              3. Horizonte de investimento
            </p>
            <div className="flex gap-3 flex-wrap mb-6">
              {HORIZONS.map(h => (
                <button
                  key={h}
                  onClick={() => { setMonths(h); setSaved(false); }}
                  className={`flex-1 min-w-[64px] rounded-xl py-3 font-black text-sm transition-all ${
                    months === h
                      ? "bg-primary text-black shadow-lg"
                      : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10"
                  }`}
                >
                  {h}m
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 bg-black/20 rounded-xl p-4 border border-white/10">
              <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-white font-bold text-sm">{months} meses = {(months / 12).toFixed(1)} anos</p>
                <p className="text-white/40 text-xs">
                  {breakEvenInRange
                    ? `✅ Break-even realista no ${sim.realist.breakEven}º mês`
                    : `⚠️ Break-even realista no ${sim.realist.breakEven}º mês (fora do período)`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── KPIs ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: DollarSign,
              label: "Lucro Realista",
              value: fmt(sim.realist.totalProfit),
              sub: `+${fmtPct(sim.realist.roi)} do capital`,
              color: "#4ade80",
            },
            {
              icon: TrendingUp,
              label: "Capital + Retorno",
              value: fmt(sim.realist.totalReturn),
              sub: "Cenário realista",
              color: "#22d3ee",
            },
            {
              icon: Target,
              label: "Renda Mensal Est.",
              value: fmt(amount * modality.rates.realist / 12),
              sub: `${fmtPct(modality.rates.realist / 12 * 100)} a.m.`,
              color: "#a78bfa",
            },
            {
              icon: Calendar,
              label: "Break-even",
              value: `${sim.realist.breakEven}º mês`,
              sub: breakEvenInRange ? "✅ Dentro do período" : "⏳ Após o período",
              color: "#F5E642",
            },
          ].map(k => (
            <div key={k.label} className="rounded-2xl bg-card border border-white/10 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: k.color + "22" }}>
                  <k.icon className="w-4 h-4" style={{ color: k.color }} />
                </div>
                <span className="text-white/50 text-xs font-semibold">{k.label}</span>
              </div>
              <p className="text-white font-black text-lg md:text-xl leading-none mb-1">{k.value}</p>
              <p className="text-white/40 text-xs">{k.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Chart ── */}
        <div className="rounded-2xl bg-card border border-white/10 p-6 md:p-8">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h2 className="text-white font-black text-lg">Projeção de Retorno Acumulado</h2>
              <p className="text-white/40 text-sm">Renda acumulada recebida vs. break-even do capital investido</p>
            </div>
            <div className="flex gap-4 text-xs text-white/40">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-white/20 inline-block" style={{ border: "1px dashed rgba(255,255,255,0.3)" }} />
                Capital (R$ {fmt(amount).replace("R$", "").trim()})
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={340}>
            <AreaChart data={sim.points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradOpt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gradReal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="gradPess" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="mes"
                tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => v === 0 ? "Início" : `M${v}`}
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => v >= 1000000 ? `${(v/1000000).toFixed(1)}M` : v >= 1000 ? `${(v/1000).toFixed(0)}k` : String(v)}
                width={60}
              />
              <Tooltip content={<SimTooltip amount={amount} />} />
              <Legend
                formatter={v => v === "optimist" ? "Otimista" : v === "realist" ? "Realista" : "Conservador"}
                wrapperStyle={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}
              />
              <ReferenceLine
                y={amount}
                stroke="rgba(255,255,255,0.25)"
                strokeDasharray="6 4"
                label={{ value: "Break-even", fill: "rgba(255,255,255,0.4)", fontSize: 11, position: "right" }}
              />
              <Area type="monotone" dataKey="optimist" stroke="#4ade80" strokeWidth={2} fill="url(#gradOpt)" dot={false} activeDot={{ r: 5, fill: "#4ade80" }} />
              <Area type="monotone" dataKey="realist" stroke="#22d3ee" strokeWidth={2.5} fill="url(#gradReal)" dot={false} activeDot={{ r: 6, fill: "#22d3ee" }} />
              <Area type="monotone" dataKey="pessimist" stroke="#a78bfa" strokeWidth={1.5} fill="url(#gradPess)" dot={false} activeDot={{ r: 4, fill: "#a78bfa" }} />
            </AreaChart>
          </ResponsiveContainer>

          {/* Cenários */}
          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
            {[
              { label: "Conservador", rate: modality.rates.pessimist, result: sim.pessimist, color: "#a78bfa" },
              { label: "Realista", rate: modality.rates.realist, result: sim.realist, color: "#22d3ee" },
              { label: "Otimista", rate: modality.rates.optimist, result: sim.optimist, color: "#4ade80" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-white/40 text-xs mb-1">{s.label}</p>
                <p className="font-black text-sm md:text-base" style={{ color: s.color }}>
                  {fmt(s.result.totalProfit)}
                </p>
                <p className="text-white/30 text-xs">{fmtPct(s.result.roi)} ROI • {Math.round(s.rate * 100)}% a.a.</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tabela ── */}
        <div className="rounded-2xl bg-card border border-white/10 overflow-hidden">
          <button
            onClick={() => setShowTable(v => !v)}
            className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
          >
            <span className="text-white font-black text-sm">
              Projeção mês a mês ({months} meses)
            </span>
            {showTable ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
          </button>
          {showTable && (
            <div className="overflow-x-auto border-t border-white/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/5">
                    <th className="px-4 py-3 text-left text-white/50 text-xs font-semibold">Mês</th>
                    <th className="px-4 py-3 text-right text-white/50 text-xs font-semibold">Renda Mensal</th>
                    <th className="px-4 py-3 text-right text-[#a78bfa] text-xs font-semibold">Conservador</th>
                    <th className="px-4 py-3 text-right text-[#22d3ee] text-xs font-semibold">Realista</th>
                    <th className="px-4 py-3 text-right text-[#4ade80] text-xs font-semibold">Otimista</th>
                    <th className="px-4 py-3 text-right text-white/50 text-xs font-semibold">% Do Capital</th>
                  </tr>
                </thead>
                <tbody>
                  {sim.points.filter(p => p.mes > 0).map(p => {
                    const pct = (sim.realist.data[p.mes].cumulative / amount) * 100;
                    const isBreakEven = p.mes === sim.realist.breakEven;
                    return (
                      <tr
                        key={p.mes}
                        className={`border-t border-white/5 transition-colors hover:bg-white/5 ${
                          isBreakEven ? "bg-emerald-500/10 border-emerald-500/30" : ""
                        }`}
                      >
                        <td className="px-4 py-3 text-white/60">
                          {isBreakEven ? "🎯 " : ""}{p.mes}
                        </td>
                        <td className="px-4 py-3 text-right text-white font-semibold">
                          {fmt(amount * modality.rates.realist / 12)}
                        </td>
                        <td className="px-4 py-3 text-right text-[#a78bfa] font-medium">
                          {fmt(p.pessimist)}
                        </td>
                        <td className="px-4 py-3 text-right text-[#22d3ee] font-bold">
                          {fmt(p.realist)}
                        </td>
                        <td className="px-4 py-3 text-right text-[#4ade80] font-medium">
                          {fmt(p.optimist)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`text-xs font-black ${pct >= 100 ? "text-emerald-400" : "text-white/40"}`}>
                            {pct.toFixed(0)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── CTAs ── */}
        <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h3 className="text-white font-black text-lg mb-1">
                Gostou da projeção? Fale com um especialista.
              </h3>
              <p className="text-white/50 text-sm max-w-lg">
                Salve esta simulação no sistema para que nossa equipe analise e entre em contato com uma proposta personalizada para você.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
              <button
                onClick={handleSave}
                disabled={saving || amount < modality.minAmount}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm transition-all ${
                  saved
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-primary text-black hover:bg-primary/90 disabled:opacity-50"
                }`}
              >
                {saving ? (
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                ) : saved ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saved ? "Simulação salva!" : saving ? "Salvando..." : "Salvar simulação"}
              </button>
              <a
                href={`https://wa.me/5511999294694?text=${waMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm bg-[#25d366] text-white hover:bg-[#1fb856] transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                Falar com especialista
              </a>
            </div>
          </div>
        </div>

        {/* ── Histórico de simulações ── */}
        {history.length > 0 && (
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6 md:p-8">
            <h3 className="text-white font-black text-base mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Suas últimas simulações
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left pb-3 text-white/40 font-semibold text-xs uppercase tracking-wider">Modalidade</th>
                    <th className="text-right pb-3 text-white/40 font-semibold text-xs uppercase tracking-wider">Investimento</th>
                    <th className="text-right pb-3 text-white/40 font-semibold text-xs uppercase tracking-wider">Prazo</th>
                    <th className="text-right pb-3 text-white/40 font-semibold text-xs uppercase tracking-wider">Retorno Realista</th>
                    <th className="text-right pb-3 text-white/40 font-semibold text-xs uppercase tracking-wider">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {history.map(s => {
                    const inv = Number(s.investmentAmount);
                    const ret = Number(s.realistReturn);
                    const roi = inv > 0 ? ((ret - inv) / inv) * 100 : 0;
                    const date = new Date(s.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" });
                    return (
                      <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 text-white font-semibold">{s.modalityLabel || "—"}</td>
                        <td className="py-3 text-right text-white/70">{fmt(inv)}</td>
                        <td className="py-3 text-right text-white/70">{s.months}m</td>
                        <td className="py-3 text-right">
                          <span className="text-emerald-400 font-bold">{fmt(ret)}</span>
                          <span className="text-white/30 text-xs ml-1">(+{roi.toFixed(0)}%)</span>
                        </td>
                        <td className="py-3 text-right text-white/30 text-xs">{date}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Disclaimer ── */}
        <p className="text-white/20 text-xs text-center pb-4">
          ⚠️ As projeções apresentadas são estimativas baseadas no histórico operacional da VaideVan e não constituem garantia de rentabilidade futura.
          Investimentos estão sujeitos a riscos de mercado. Consulte um assessor financeiro antes de tomar decisões.
        </p>
      </div>
    </DashboardLayout>
  );
}
