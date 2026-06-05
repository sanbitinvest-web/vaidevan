import { useEffect, useState, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { api } from "@/lib/api";
import { RefreshCw } from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";

function fmt(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

const COLORS = ["#F5E642", "#22c55e", "#3b82f6", "#f97316", "#a855f7", "#ef4444", "#06b6d4", "#84cc16"];

export default function Financeiro() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [filter, setFilter] = useState<"all" | "income" | "expense">("all");

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const result = await api.financials();
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
    const interval = setInterval(() => fetchData(true), 30_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const categoryData = data
    ? Object.entries(data.byCategory as Record<string, { income: number; expense: number }>).map(
        ([cat, vals]) => ({ name: cat, receita: vals.income, despesa: vals.expense })
      )
    : [];

  const expenseCategories = data
    ? Object.entries(data.byCategory as Record<string, { income: number; expense: number }>)
        .filter(([, v]) => v.expense > 0)
        .map(([name, v]) => ({ name, value: v.expense }))
    : [];

  const filtered = data?.records?.filter((r: any) => filter === "all" || r.type === filter) ?? [];

  const monthlyData = data
    ? Object.entries(data.monthly as Record<string, { income: number; expense: number }>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, vals]) => ({
          mes: new Date(month + "-01").toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
          Receita: vals.income,
          Despesa: vals.expense,
        }))
    : [];

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-white">Painel Financeiro</h1>
            {lastUpdated && (
              <p className="text-white/30 text-xs mt-1">
                Atualizado às {lastUpdated.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </p>
            )}
          </div>
          <button
            onClick={() => fetchData(false)}
            disabled={refreshing}
            title="Atualizar dados"
            className="w-9 h-9 rounded-xl border border-white/10 bg-card flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all disabled:opacity-40"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-64 bg-card rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <>
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-card border border-white/10 rounded-2xl p-6">
                <h2 className="font-black text-white mb-6">Receitas x Despesas por Mês</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="mes" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} />
                    <YAxis stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} formatter={(v: any) => fmt(v)} />
                    <Legend />
                    <Bar dataKey="Receita" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Despesa" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-card border border-white/10 rounded-2xl p-6">
                <h2 className="font-black text-white mb-6">Despesas por Categoria</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={expenseCategories} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {expenseCategories.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} formatter={(v: any) => fmt(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-card border border-white/10 rounded-2xl p-6 mb-6">
              <h2 className="font-black text-white mb-6">Receitas x Despesas por Categoria</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={categoryData} layout="vertical" margin={{ left: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis type="number" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{ fontSize: 11 }} width={100} />
                  <Tooltip contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} formatter={(v: any) => fmt(v)} />
                  <Legend />
                  <Bar dataKey="receita" name="Receita" fill="#22c55e" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="despesa" name="Despesa" fill="#ef4444" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-black text-white">Lançamentos</h2>
                <div className="flex gap-2">
                  {(["all", "income", "expense"] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                        filter === f ? "bg-primary text-black" : "bg-white/10 text-white/60 hover:bg-white/20"
                      }`}
                    >
                      {f === "all" ? "Todos" : f === "income" ? "Receitas" : "Despesas"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-white/40 font-semibold py-3 pr-4">Data</th>
                      <th className="text-left text-white/40 font-semibold py-3 pr-4">Categoria</th>
                      <th className="text-left text-white/40 font-semibold py-3 pr-4">Descrição</th>
                      <th className="text-right text-white/40 font-semibold py-3">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.slice(0, 20).map((r: any) => (
                      <tr key={r.id} className="border-b border-white/5">
                        <td className="py-3 pr-4 text-white/50">{new Date(r.date).toLocaleDateString("pt-BR")}</td>
                        <td className="py-3 pr-4">
                          <span className="bg-white/10 text-white/70 text-xs rounded-full px-2 py-0.5">{r.category}</span>
                        </td>
                        <td className="py-3 pr-4 text-white/70">{r.description || "—"}</td>
                        <td className={`py-3 text-right font-black ${r.type === "income" ? "text-green-400" : "text-red-400"}`}>
                          {r.type === "income" ? "+" : "-"}{fmt(Number(r.amount))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
