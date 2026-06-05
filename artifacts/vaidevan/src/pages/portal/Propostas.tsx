import { useState, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Legend,
} from "recharts";
import {
  TrendingUp, Car, Shield, CheckCircle2, PhoneCall, FileText,
  ChevronDown, ChevronUp, Zap, BarChart3, Lock, CalendarCheck, Wallet,
  Star, Info, ArrowRight, BadgePercent, Wrench, Home, RefreshCw,
  Sparkles, Package, CreditCard, Users, AlertTriangle, ArrowUpRight,
} from "lucide-react";

/* ══════════════════════════ helpers ══════════════════════════ */
function fmt(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);
}

/* ══════════════════════════ chart data ══════════════════════════ */
const marketGrowthData = [
  { ano: "2020", mercado: 78,  label: "R$ 7,8 bi"  },
  { ano: "2021", mercado: 108, label: "R$ 10,8 bi" },
  { ano: "2022", mercado: 145, label: "R$ 14,5 bi" },
  { ano: "2023", mercado: 186, label: "R$ 18,6 bi" },
  { ano: "2024", mercado: 228, label: "R$ 22,8 bi" },
  { ano: "2025p", mercado: 278, label: "R$ 27,8 bi" },
  { ano: "2026p", mercado: 334, label: "R$ 33,4 bi" },
  { ano: "2027p", mercado: 398, label: "R$ 39,8 bi" },
];

const returnComparisonData = [
  { name: "Poupança",        min: 7.7,  max: 7.7,  vaidevan: false },
  { name: "CDI",             min: 10.5, max: 10.5, vaidevan: false },
  { name: "CDB 100%",        min: 11.2, max: 11.2, vaidevan: false },
  { name: "Tesouro IPCA+",   min: 12.0, max: 12.0, vaidevan: false },
  { name: "FII médio",       min: 13.8, max: 13.8, vaidevan: false },
  { name: "Cota Inicial",    min: 28.8, max: 38.4, vaidevan: true  },
  { name: "Cota Parceria",   min: 32.4, max: 43.2, vaidevan: true  },
  { name: "Frota Própria",   min: 34.0, max: 52.0, vaidevan: true  },
  { name: "Sprinter Novo",   min: 38.0, max: 55.0, vaidevan: true  },
];

/* risco: 0-100, retorno: % a.a. — posicionamento visual em CSS */
const riskReturnItems = [
  { label: "Poupança",       risk: 5,  retorno: 7.7,  color: "#4B5563", size: 32, group: "mercado"  },
  { label: "CDI / CDB",      risk: 10, retorno: 11.0, color: "#6B7280", size: 34, group: "mercado"  },
  { label: "Tesouro IPCA+",  risk: 12, retorno: 12.0, color: "#9CA3AF", size: 34, group: "mercado"  },
  { label: "FII médio",      risk: 38, retorno: 13.8, color: "#9CA3AF", size: 38, group: "mercado"  },
  { label: "Ações (Ibov)",   risk: 62, retorno: 15.5, color: "#EF4444", size: 38, group: "mercado"  },
  { label: "Van Flex",       risk: 20, retorno: 22.0, color: "#60A5FA", size: 42, group: "vaidevan" },
  { label: "Cota Inicial",   risk: 26, retorno: 33.0, color: "#F5E642", size: 44, group: "vaidevan" },
  { label: "Frota Própria",  risk: 30, retorno: 43.0, color: "#F5E642", size: 50, group: "vaidevan" },
  { label: "Cota Parceria",  risk: 34, retorno: 37.8, color: "#F5E642", size: 46, group: "vaidevan" },
  { label: "Cota Master",    risk: 38, retorno: 42.0, color: "#FBBF24", size: 50, group: "vaidevan" },
  { label: "Sprinter Novo",  risk: 42, retorno: 48.0, color: "#A78BFA", size: 54, group: "vaidevan" },
];

/* ══════════════════════════ cotas data ══════════════════════════ */
const cotas = [
  {
    id: "inicial", nome: "Cota Inicial", tag: "Mais acessível",
    tagColor: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    borderColor: "border-blue-400/30", accentColor: "#60A5FA",
    descricao: "Participação compartilhada em 1 Mercedes-Benz Sprinter Executive. Ideal para o primeiro investimento.",
    precoCota: 20000, cotasTotal: 10, cotasVendidas: 2,
    retornoMin: 480, retornoMax: 640, prazoMeses: 36,
    roaAnualMin: 28.8, roaAnualMax: 38.4,
    garantia: "Veículo em alienação fiduciária + seguro integral",
    beneficios: ["Gestão 100% pela VaideVan","Motorista profissional incluso","Rastreamento em tempo real","Relatórios mensais","Seguro total","Pagamento todo dia 10"],
    minCotas: 1, maxCotas: 8,
  },
  {
    id: "parceria", nome: "Cota Parceria", tag: "Mais escolhida",
    tagColor: "text-primary bg-primary/10 border-primary/20",
    borderColor: "border-primary/40", accentColor: "#F5E642",
    descricao: "Frota compartilhada com 4 cotas por Sprinter Executive Premium. Maior volume e retorno escalado.",
    precoCota: 50000, cotasTotal: 6, cotasVendidas: 3,
    retornoMin: 1350, retornoMax: 1800, prazoMeses: 48,
    roaAnualMin: 32.4, roaAnualMax: 43.2,
    garantia: "Frota em alienação fiduciária + seguro + fiança",
    beneficios: ["Gestão 100% pela VaideVan","Motorista dedicado","Dashboard de rastreamento","Relatórios mensais e trimestrais","Seguro total + DPVAT","Contratos corporativos prioritários","Assessoria contábil"],
    minCotas: 1, maxCotas: 3, destaque: true,
  },
  {
    id: "executiva", nome: "Cota Executiva", tag: "Alta rentabilidade",
    tagColor: "text-violet-400 bg-violet-400/10 border-violet-400/20",
    borderColor: "border-violet-400/30", accentColor: "#A78BFA",
    descricao: "2 veículos executivos (Sprinter + Sedan). Contratos de longo prazo com grandes empresas.",
    precoCota: 100000, cotasTotal: 4, cotasVendidas: 1,
    retornoMin: 2900, retornoMax: 3800, prazoMeses: 48,
    roaAnualMin: 34.8, roaAnualMax: 45.6,
    garantia: "2 veículos em alienação fiduciária + seguro + fiança bancária",
    beneficios: ["Gestão 100% VaideVan","Equipe de motoristas dedicada","Dashboard exclusivo em tempo real","Relatórios semanais e mensais","Seguro total + DPVAT","Contratos corporativos prioritários","Assessoria jurídica e contábil","Reinvestimento automático opcional"],
    minCotas: 1, maxCotas: 3,
  },
  {
    id: "master", nome: "Cota Master", tag: "Frota dedicada",
    tagColor: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    borderColor: "border-amber-400/30", accentColor: "#FBBF24",
    descricao: "Sprinter Executive dedicado ao investidor com carteira de clientes corporativos já estabelecida.",
    precoCota: 200000, cotasTotal: 3, cotasVendidas: 2,
    retornoMin: 6000, retornoMax: 8000, prazoMeses: 60,
    roaAnualMin: 36.0, roaAnualMax: 48.0,
    garantia: "Sprinter dedicado + seguro + fiança + contrato corporativo",
    beneficios: ["Sprinter de uso exclusivo","Carteira de clientes transferida","Motorista sênior dedicado","Dashboard + app proprietários","Relatórios semanais, mensais e anuais","Seguro total + DPVAT + danos a terceiros","Assessoria jurídica e contábil completa","Reinvestimento automático opcional"],
    minCotas: 1, maxCotas: 1,
  },
];

/* ══════════════════════════ veículos (aquisição) ══════════════════════════ */
const veiculos = [
  {
    id: "vito-semi",
    nome: "Mercedes-Benz Vito",
    tipo: "Seminovo 2020–2022",
    badge: "Entrada acessível",
    badgeColor: "text-blue-400 bg-blue-400/10",
    preco: 98000,
    customizacao: 18000,
    total: 116000,
    retornoMin: 2800,
    retornoMax: 3800,
    roiAnual: "29–39%",
    passageiros: 7,
    cor: "#60A5FA",
    upfit: ["Poltronas executivas","Climatização premium","Cortinas privativas","Carregadores USB","Iluminação de cabine LED"],
    ideal: "Transfer aeroporto, turismo executivo, diária corporativa",
  },
  {
    id: "sprinter-semi",
    nome: "Mercedes-Benz Sprinter Executive",
    tipo: "Seminovo 2022–2024",
    badge: "Melhor custo-benefício",
    badgeColor: "text-primary bg-primary/10",
    preco: 138000,
    customizacao: 28000,
    total: 166000,
    retornoMin: 4200,
    retornoMax: 5800,
    roiAnual: "30–42%",
    passageiros: 14,
    cor: "#F5E642",
    upfit: ["Poltronas couro reclináveis","Wi-Fi embarcado","Mini bar refrigerado","Monitor central","Personalização VaideVan completa"],
    ideal: "Fretamento corporativo, grupos VIP, eventos premium",
  },
  {
    id: "sprinter-novo",
    nome: "Mercedes-Benz Sprinter Executive",
    tipo: "0 km — Novo",
    badge: "Maior retorno",
    badgeColor: "text-violet-400 bg-violet-400/10",
    preco: 285000,
    customizacao: 48000,
    total: 333000,
    retornoMin: 7500,
    retornoMax: 10500,
    roiAnual: "27–38%",
    passageiros: 16,
    cor: "#A78BFA",
    upfit: ["Conversão JetVan / LimoVan","Blindagem opcional (IIIA)","Central multimídia 4K","Mini bar premium + frigobar","Wi-Fi 4G + pontos USB-C","Iluminação ambiente RBG programável","Poltronas massageadoras"],
    ideal: "Contratos corporativos de grande porte, VIPs, delegações",
    destaque: true,
  },
  {
    id: "sprinter-blind",
    nome: "Mercedes-Benz Sprinter Executive",
    tipo: "0 km + Blindagem IIIA",
    badge: "Máxima segurança",
    badgeColor: "text-amber-400 bg-amber-400/10",
    preco: 285000,
    customizacao: 128000,
    total: 413000,
    retornoMin: 10000,
    retornoMax: 14000,
    roiAnual: "29–41%",
    passageiros: 14,
    cor: "#FBBF24",
    upfit: ["Blindagem IIIA certificada","Interior JetVan completo","Sistema de rastreamento dedicado","Poltronas executivas especiais","Vidros blindados laminados","Protocolo de segurança VaideVan"],
    ideal: "Executivos C-Suite, embaixadas, clientes alto padrão de segurança",
  },
];

/* ══════════════════════════ terceirização ══════════════════════════ */
const terceirizacaoModelos = [
  {
    id: "gestao-completa",
    nome: "Gestão Completa",
    icon: Wrench,
    cor: "#F5E642",
    desc: "Entregue seu veículo para a VaideVan administrar tudo: motoristas, manutenção, agendamentos e faturamento. Você só recebe o resultado.",
    split: "70% investidor / 30% VaideVan",
    retornoMin: 3500,
    retornoMax: 6000,
    requisitos: ["Sprinter ou Vito até 5 anos","CRLV atualizado","Seguro vigente (ou contratamos)","Vistoria de aprovação VaideVan"],
    incluso: ["Motorista profissional treinado","Manutenção preventiva e corretiva","Central de reservas 24h","Relatórios mensais detalhados","Seguro complementar","Rastreamento em tempo real"],
  },
  {
    id: "gestao-parcial",
    nome: "Gestão de Reservas",
    icon: CalendarCheck,
    cor: "#60A5FA",
    desc: "Você mantém seu motorista. A VaideVan cuida das reservas, contratos corporativos e cobrança. Ideal para frotas com equipe própria.",
    split: "85% investidor / 15% VaideVan",
    retornoMin: 2800,
    retornoMax: 4800,
    requisitos: ["Qualquer Sprinter / Vito","Motorista próprio certificado","Veículo vistoriado e aprovado"],
    incluso: ["Central de reservas corporativas","Contratos e faturamento","Suporte jurídico","Relatórios mensais","Acesso à carteira VaideVan"],
  },
  {
    id: "temporada",
    nome: "Locação por Temporada",
    icon: RefreshCw,
    cor: "#A78BFA",
    desc: "Disponibilize seu veículo apenas nos períodos que desejar — alta temporada, férias, eventos. Sem comprometimento mensal fixo.",
    split: "75% investidor / 25% VaideVan",
    retornoMin: 1200,
    retornoMax: 3500,
    requisitos: ["Qualquer van executiva","Mínimo 10 dias/mês no período","Aprovação de vistoria prévia"],
    incluso: ["Cobertura de seguro no período","Motorista disponível se necessário","Central de reservas","Relatório do período"],
  },
];

/* ══════════════════════════ FAQ ══════════════════════════ */
const faqs = [
  { q: "Como é calculado o retorno mensal?", a: "O retorno é apurado mensalmente com base na receita bruta das operações (fretamentos, transfers, contratos corporativos) menos custos operacionais (motorista, combustível, seguro, manutenção) e a taxa de administração VaideVan (12–30% conforme modalidade). O valor líquido é distribuído proporcionalmente às cotas ou ao acordo contratual." },
  { q: "Qual a garantia real do investimento?", a: "Cada modalidade tem garantia patrimonial própria: veículo em alienação fiduciária, seguro integral com cobertura total, e para modelos Executiva e Master, fiança bancária adicional. Na modalidade Frota Própria, o próprio veículo do investidor é garantia." },
  { q: "Posso resgatar meu investimento antes do prazo?", a: "Há liquidez parcial após 12 meses: o investidor pode revender a cota para outro qualificado ou para a VaideVan conforme tabela de recompra. Resgates antes de 12 meses estão sujeitos a penalidade de 8% sobre o capital." },
  { q: "O que acontece se o veículo ficar sem operação?", a: "A VaideVan garante contratualmente taxa mínima de ocupação mensal de 80%. Se não atingida, a diferença é compensada pela reserva operacional. Em caso de sinistro, o seguro integral cobre substituição ou reparo sem impacto nos retornos." },
  { q: "Posso usar meu veículo pessoalmente e ainda rentabilizar?", a: "Sim — essa é exatamente a modalidade Van Família Flex. Você define os dias disponíveis para locação (mínimo 12 dias/mês). Nos períodos ociosos, a VaideVan gera renda que pode cobrir parcela ou custeio total do financiamento e seguro." },
  { q: "Preciso comprar um veículo para investir?", a: "Não. Você pode investir apenas com capital financeiro pelas modalidades de Cotas, sem precisar adquirir veículos. Mas se tiver veículo próprio ou quiser adquirir, as modalidades Frota Própria, Adquirir & Operar e Van Flex oferecem retornos ainda maiores." },
];

/* ══════════════════════════ subcomponentes ══════════════════════════ */
function AvailabilityBar({ total, sold, color }: { total: number; sold: number; color: string }) {
  const available = total - sold;
  const pct = (available / total) * 100;
  return (
    <div className="mt-1">
      <div className="flex justify-between text-xs text-white/40 mb-1">
        <span>{available} de {total} disponíveis</span>
        <span className="font-bold" style={{ color }}>{available === 1 ? "Última cota!" : `${available} restantes`}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors">
        <span className="text-sm font-bold text-white pr-4">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-primary flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-white/40 flex-shrink-0" />}
      </button>
      {open && <div className="px-4 pb-4 text-sm text-white/60 leading-relaxed border-t border-white/10 pt-3">{a}</div>}
    </div>
  );
}

/* ══════════════════════════ gráficos de mercado ══════════════════════════ */
function MarketCharts() {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-5">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h2 className="font-black text-white text-xl">Por que investir agora?</h2>
        <span className="text-xs text-white/30 ml-1">— mercado de transporte executivo corporativo Brasil</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Crescimento do mercado */}
        <div className="bg-card border border-white/10 rounded-2xl p-5 lg:col-span-1">
          <p className="text-sm font-black text-white mb-1">Crescimento do mercado</p>
          <p className="text-xs text-white/40 mb-4">Volume total em R$ bilhões · CAGR +22,5% a.a.</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={marketGrowthData}>
              <defs>
                <linearGradient id="gradMkt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F5E642" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F5E642" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="ano" tick={{ fill: "#ffffff50", fontSize: 10 }} />
              <YAxis tick={{ fill: "#ffffff50", fontSize: 10 }} domain={[0, 450]} />
              <Tooltip
                contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, fontSize: 11 }}
                labelStyle={{ color: "#fff" }}
                formatter={(v: number) => [`R$ ${(v / 10).toFixed(1)} bi`, "Mercado"]}
              />
              <Area type="monotone" dataKey="mercado" stroke="#F5E642" strokeWidth={2} fill="url(#gradMkt)" dot={{ fill: "#F5E642", r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-3 flex gap-4">
            <div>
              <p className="text-xs text-white/30">2024 (real)</p>
              <p className="text-sm font-black text-white">R$ 22,8 bi</p>
            </div>
            <div>
              <p className="text-xs text-white/30">2027 (proj.)</p>
              <p className="text-sm font-black text-primary">R$ 39,8 bi</p>
            </div>
            <div>
              <p className="text-xs text-white/30">CAGR</p>
              <p className="text-sm font-black text-green-400">+22,5%</p>
            </div>
          </div>
        </div>

        {/* Comparação de retornos */}
        <div className="bg-card border border-white/10 rounded-2xl p-5 lg:col-span-1">
          <p className="text-sm font-black text-white mb-1">Retorno comparado ao mercado</p>
          <p className="text-xs text-white/40 mb-4">% a.a. estimado · linha amarela = VaideVan</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={returnComparisonData} layout="vertical" margin={{ left: 0, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#ffffff50", fontSize: 10 }} domain={[0, 60]} unit="%" />
              <YAxis dataKey="name" type="category" tick={{ fill: "#ffffff60", fontSize: 9 }} width={88} />
              <Tooltip
                contentStyle={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, fontSize: 11 }}
                formatter={(v: number, name: string) => [`${v.toFixed(1)}%`, name]}
              />
              <Bar dataKey="min" name="Mín." fill="#ffffff20" radius={[0, 2, 2, 0]} />
              <Bar dataKey="max" name="Máx." radius={[0, 2, 2, 0]}
                fill="#F5E642"
                label={{ position: "right", fill: "#F5E64290", fontSize: 9, formatter: (v: number) => v > 13 ? `${v}%` : "" }}
              />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-white/20 mt-2">* Retornos de mercado: dez/2024. VaideVan: histórico 2023–2024. Não é garantia de resultado futuro.</p>
        </div>

        {/* Matriz risco vs retorno */}
        <div className="bg-card border border-white/10 rounded-2xl p-5 lg:col-span-1">
          <p className="text-sm font-black text-white mb-1">Risco × Retorno</p>
          <p className="text-xs text-white/40 mb-3">Posicionamento competitivo por modalidade</p>
          <div className="relative w-full" style={{ height: 180 }}>
            {/* eixos */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />
            <div className="absolute left-0 top-0 bottom-0 w-px bg-white/10" />
            <span className="absolute bottom-1 right-0 text-xs text-white/20">risco →</span>
            <span className="absolute left-1 top-0 text-xs text-white/20" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>retorno →</span>

            {/* zona VaideVan highlight */}
            <div className="absolute rounded-xl border border-primary/20 bg-primary/5"
              style={{ left: "16%", right: "52%", top: "5%", bottom: "28%" }}
            >
              <span className="absolute -top-2.5 left-2 text-primary text-xs font-bold">VaideVan</span>
            </div>

            {/* bubbles */}
            {riskReturnItems.map(item => {
              const left = (item.risk / 100) * 88 + 5;
              const top = 92 - (item.retorno / 55) * 85;
              return (
                <div
                  key={item.label}
                  className="absolute flex items-center justify-center rounded-full border border-white/10 cursor-default"
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    width: item.size,
                    height: item.size,
                    backgroundColor: item.color + "22",
                    borderColor: item.color + "60",
                    transform: "translate(-50%, -50%)",
                  }}
                  title={`${item.label}: ${item.retorno}% a.a. — Risco ${item.risk}/100`}
                >
                  <span className="text-center font-bold leading-tight"
                    style={{ fontSize: 8, color: item.color, maxWidth: item.size - 6 }}>
                    {item.label.split(" ").slice(0, 2).join("\n")}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-primary/60" />
              <span className="text-xs text-white/40">VaideVan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
              <span className="text-xs text-white/40">Mercado tradicional</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#EF4444" }} />
              <span className="text-xs text-white/40">Alta volatilidade</span>
            </div>
          </div>
        </div>
      </div>

      {/* métricas de convicção */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
        {[
          { v: "+22,5%",  label: "CAGR mercado 2020–2024",       sub: "crescimento anual composto"     },
          { v: "85%",     label: "Ocupação média da frota",       sub: "contratos corporativos ativos"  },
          { v: "20+ anos",label: "VaideVan no mercado",           sub: "marca registrada, INPI"         },
          { v: "R$ 0",    label: "Sem gestão pelo investidor",    sub: "operação 100% terceirizada"     },
        ].map(m => (
          <div key={m.v} className="bg-white/5 border border-white/10 rounded-xl p-4">
            <p className="text-2xl font-black text-primary">{m.v}</p>
            <p className="text-xs font-bold text-white mt-1">{m.label}</p>
            <p className="text-xs text-white/30 mt-0.5">{m.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════ calculadora de cotas ══════════════════════════ */
function Calculadora() {
  const [selectedId, setSelectedId] = useState("parceria");
  const [numCotas, setNumCotas] = useState(1);
  const cota = cotas.find(c => c.id === selectedId)!;
  const safeNum = Math.max(cota.minCotas, Math.min(numCotas, cota.maxCotas));
  const investTotal = cota.precoCota * safeNum;
  const retMin = cota.retornoMin * safeNum;
  const retMax = cota.retornoMax * safeNum;
  const retMid = (retMin + retMax) / 2;
  const retornoTotal = retMid * cota.prazoMeses;
  const roiAnual = ((retMid * 12 / investTotal) * 100).toFixed(1);

  return (
    <div className="bg-card border border-white/10 rounded-2xl p-6 lg:p-8">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-primary" />
        <h2 className="font-black text-white text-xl">Simulador de retorno</h2>
        <span className="text-xs text-white/30 ml-1">— estimativa baseada em histórico operacional</span>
      </div>
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="text-xs font-bold text-white/40 uppercase tracking-wider block mb-2">Modelo de cota</label>
          <div className="grid grid-cols-2 gap-2">
            {cotas.map(c => (
              <button key={c.id} onClick={() => { setSelectedId(c.id); setNumCotas(c.minCotas); }}
                className={`p-3 rounded-xl border text-left transition-all ${selectedId === c.id ? "border-primary/60 bg-primary/10" : "border-white/10 hover:border-white/20"}`}>
                <p className="text-xs font-black text-white">{c.nome}</p>
                <p className="text-xs text-white/40 mt-0.5">{fmt(c.precoCota)}/cota</p>
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-white/40 uppercase tracking-wider block mb-2">
            Número de cotas <span className="text-white/20 font-normal">(máx. {cota.maxCotas})</span>
          </label>
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => setNumCotas(Math.max(cota.minCotas, safeNum - 1))} className="w-10 h-10 rounded-xl border border-white/10 text-white hover:bg-white/5 font-bold text-lg flex items-center justify-center">−</button>
            <div className="flex-1 text-center">
              <span className="text-4xl font-black text-white">{safeNum}</span>
              <span className="text-white/30 ml-1 text-sm">cota{safeNum > 1 ? "s" : ""}</span>
            </div>
            <button onClick={() => setNumCotas(Math.min(cota.maxCotas, safeNum + 1))} className="w-10 h-10 rounded-xl border border-white/10 text-white hover:bg-white/5 font-bold text-lg flex items-center justify-center">+</button>
          </div>
          <input type="range" min={cota.minCotas} max={cota.maxCotas} value={safeNum} onChange={e => setNumCotas(Number(e.target.value))} className="w-full accent-primary" />
          <div className="mt-3 bg-white/5 rounded-xl p-3">
            <p className="text-xs text-white/40">Investimento total</p>
            <p className="text-2xl font-black text-primary">{fmt(investTotal)}</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <div className="bg-white/5 rounded-xl p-4"><p className="text-xs text-white/40 mb-1">Retorno mensal est.</p><p className="text-lg font-black text-white">{fmt(retMin)}</p><p className="text-xs text-white/30">até {fmt(retMax)}</p></div>
        <div className="bg-white/5 rounded-xl p-4"><p className="text-xs text-white/40 mb-1">Retorno anual est.</p><p className="text-lg font-black text-white">{fmt(retMin * 12)}</p><p className="text-xs text-white/30">até {fmt(retMax * 12)}</p></div>
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4"><p className="text-xs text-primary/70 mb-1">ROI anual estimado</p><p className="text-lg font-black text-primary">{roiAnual}%</p><p className="text-xs text-white/30">ao ano (médio)</p></div>
        <div className="bg-white/5 rounded-xl p-4"><p className="text-xs text-white/40 mb-1">Total no prazo ({cota.prazoMeses}m)</p><p className="text-lg font-black text-white">{fmt(retornoTotal)}</p><p className="text-xs text-white/30">retorno acumulado</p></div>
      </div>
      <div className="bg-white/5 rounded-xl p-4 mb-4">
        <p className="text-xs text-white/40 uppercase tracking-wider font-bold mb-3">Projeção acumulada (estimativa média)</p>
        <div className="space-y-2">
          {[
            { label: "12 meses", val: retMid * 12, pct: 12 / cota.prazoMeses },
            { label: "24 meses", val: retMid * 24, pct: 24 / cota.prazoMeses },
            { label: `${cota.prazoMeses} meses`, val: retornoTotal, pct: 1 },
          ].map(row => (
            <div key={row.label} className="flex items-center gap-3">
              <span className="text-xs text-white/40 w-24 flex-shrink-0">{row.label}</span>
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${row.pct * 100}%` }} />
              </div>
              <span className="text-xs font-bold text-white w-28 text-right">{fmt(row.val)}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-white/20 mt-3">* Projeções baseadas em histórico 2023–2024. Rentabilidade passada não garante resultado futuro.</p>
      </div>
      <a href={`https://wa.me/5511999294694?text=Olá!%20Simulei%20${safeNum}%20cota${safeNum > 1 ? "s" : ""}%20do%20modelo%20${encodeURIComponent(cota.nome)}%20(${fmt(investTotal)})%20e%20gostaria%20de%20avançar.`}
        target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-primary text-black font-black text-sm hover:bg-primary/90 transition-colors">
        <PhoneCall className="w-4 h-4" />
        Quero investir — falar com consultor
        <ArrowRight className="w-4 h-4" />
      </a>
    </div>
  );
}

/* ══════════════════════════ tab: cotas financeiras ══════════════════════════ */
function TabCotas({ calcRef }: { calcRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div>
      <div className="grid lg:grid-cols-4 gap-5 mb-8">
        {cotas.map(c => {
          const disponivel = c.cotasTotal - c.cotasVendidas;
          return (
            <div key={c.id} className={`relative bg-card border rounded-2xl flex flex-col hover:-translate-y-0.5 transition-all ${(c as any).destaque ? "border-primary/50 shadow-[0_0_30px_rgba(245,230,66,0.08)]" : c.borderColor}`}>
              {(c as any).destaque && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-black text-xs font-black px-4 py-1 rounded-full flex items-center gap-1 whitespace-nowrap">
                  <Star className="w-3 h-3" /> Mais escolhida
                </div>
              )}
              <div className="p-5 border-b border-white/10">
                <div className="flex items-start justify-between mb-2">
                  <h2 className="font-black text-white text-base">{c.nome}</h2>
                  <span className={`text-xs font-black rounded-full px-2 py-0.5 border ${c.tagColor} ml-2 whitespace-nowrap`}>{c.tag}</span>
                </div>
                <p className="text-white/40 text-xs leading-relaxed">{c.descricao}</p>
              </div>
              <div className="p-5 border-b border-white/10 space-y-3">
                <div>
                  <p className="text-white/30 text-xs mb-0.5">Valor por cota</p>
                  <p className="text-2xl font-black" style={{ color: c.accentColor }}>{fmt(c.precoCota)}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-white/30 text-xs mb-0.5">Retorno/mês</p><p className="text-sm font-black text-white">{fmt(c.retornoMin)}–{fmt(c.retornoMax)}</p></div>
                  <div><p className="text-white/30 text-xs mb-0.5">ROI a.a. est.</p><p className="text-sm font-black text-primary">{c.roaAnualMin}–{c.roaAnualMax}%</p></div>
                  <div><p className="text-white/30 text-xs mb-0.5">Prazo</p><p className="text-sm font-bold text-white">{c.prazoMeses} meses</p></div>
                  <div><p className="text-white/30 text-xs mb-0.5">Disponível</p><p className="text-xs text-white/60">{disponivel}/{c.cotasTotal} cotas</p></div>
                </div>
                <AvailabilityBar total={c.cotasTotal} sold={c.cotasVendidas} color={c.accentColor} />
              </div>
              <div className="p-5 flex-1">
                <p className="text-white/30 text-xs font-bold uppercase tracking-wider mb-3">Incluso</p>
                <ul className="flex flex-col gap-1.5">
                  {c.beneficios.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-white/60">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: c.accentColor }} />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-5 border-t border-white/10 space-y-2">
                <a href={`https://wa.me/5511999294694?text=Olá!%20Tenho%20interesse%20na%20${encodeURIComponent(c.nome)}%20(${fmt(c.precoCota)}%2Fcota).%20Podemos%20conversar%3F`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full h-10 rounded-xl font-black text-xs transition-colors"
                  style={{ backgroundColor: c.accentColor, color: "#0A0A0A" }}>
                  <PhoneCall className="w-3.5 h-3.5" /> Falar com consultor
                </a>
                <button onClick={() => calcRef.current?.scrollIntoView({ behavior: "smooth" })}
                  className="flex items-center justify-center gap-1.5 w-full h-9 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 text-xs font-bold transition-colors">
                  <BarChart3 className="w-3.5 h-3.5" /> Simular retorno
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* tabela comparativa */}
      <div className="bg-card border border-white/10 rounded-2xl overflow-hidden mb-6">
        <div className="p-5 border-b border-white/10"><h3 className="font-black text-white">Comparativo rápido</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/10">
              <th className="text-left p-4 text-white/30 text-xs font-bold uppercase tracking-wider">Modelo</th>
              <th className="text-right p-4 text-white/30 text-xs font-bold uppercase tracking-wider">Cota</th>
              <th className="text-right p-4 text-white/30 text-xs font-bold uppercase tracking-wider">Retorno/mês</th>
              <th className="text-right p-4 text-white/30 text-xs font-bold uppercase tracking-wider">ROI a.a.</th>
              <th className="text-right p-4 text-white/30 text-xs font-bold uppercase tracking-wider">Prazo</th>
              <th className="text-right p-4 text-white/30 text-xs font-bold uppercase tracking-wider">Disp.</th>
            </tr></thead>
            <tbody>
              {cotas.map(c => (
                <tr key={c.id} className={`border-b border-white/5 hover:bg-white/3 transition-colors ${(c as any).destaque ? "bg-primary/5" : ""}`}>
                  <td className="p-4"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.accentColor }} /><span className="font-bold text-white text-xs">{c.nome}</span>{(c as any).destaque && <Star className="w-3 h-3 text-primary" />}</div></td>
                  <td className="p-4 text-right font-black text-white text-xs">{fmt(c.precoCota)}</td>
                  <td className="p-4 text-right text-white/70 text-xs">{fmt(c.retornoMin)}–{fmt(c.retornoMax)}</td>
                  <td className="p-4 text-right font-bold text-xs" style={{ color: c.accentColor }}>{c.roaAnualMin}–{c.roaAnualMax}%</td>
                  <td className="p-4 text-right text-white/50 text-xs">{c.prazoMeses}m</td>
                  <td className="p-4 text-right"><span className={`text-xs font-bold ${(c.cotasTotal - c.cotasVendidas) === 1 ? "text-red-400" : "text-green-400"}`}>{c.cotasTotal - c.cotasVendidas}/{c.cotasTotal}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════ tab: terceirize sua frota ══════════════════════════ */
function TabTerceirize() {
  const [selected, setSelected] = useState(0);
  const m = terceirizacaoModelos[selected];
  const Icon = m.icon;
  return (
    <div>
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-6 flex items-start gap-4">
        <Car className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-primary font-black text-sm">Você tem o veículo — nós temos os clientes</p>
          <p className="text-white/60 text-sm mt-1">Capitalize seu Sprinter ou Vito parado ou subutilizado. A VaideVan assume a operação completa ou parcial, e você recebe resultado mensal sem envolvimento no dia a dia.</p>
        </div>
      </div>

      {/* seletores de modalidade */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {terceirizacaoModelos.map((tm, i) => {
          const TIcon = tm.icon;
          return (
            <button key={tm.id} onClick={() => setSelected(i)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${selected === i ? "bg-primary/10 border-primary/40 text-white" : "border-white/10 text-white/50 hover:text-white hover:border-white/20"}`}>
              <TIcon className="w-4 h-4" />{tm.nome}
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* detalhes da modalidade */}
        <div className="bg-card border rounded-2xl p-6" style={{ borderColor: m.cor + "40" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: m.cor + "20" }}>
              <Icon className="w-5 h-5" style={{ color: m.cor }} />
            </div>
            <div>
              <h3 className="font-black text-white text-lg">{m.nome}</h3>
              <span className="text-xs font-bold" style={{ color: m.cor }}>{m.split}</span>
            </div>
          </div>
          <p className="text-white/60 text-sm leading-relaxed mb-5">{m.desc}</p>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-white/5 rounded-xl p-3">
              <p className="text-xs text-white/30 mb-0.5">Retorno mensal est.</p>
              <p className="font-black text-white">{fmt(m.retornoMin)}</p>
              <p className="text-xs text-white/30">até {fmt(m.retornoMax)}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-3" style={{ backgroundColor: m.cor + "10" }}>
              <p className="text-xs mb-0.5" style={{ color: m.cor + "99" }}>Repasse ao investidor</p>
              <p className="font-black text-2xl" style={{ color: m.cor }}>{m.split.split(" ")[0]}</p>
              <p className="text-xs text-white/30">do resultado líquido</p>
            </div>
          </div>

          <a href={`https://wa.me/5511999294694?text=Olá!%20Tenho%20um%20veículo%20e%20quero%20saber%20sobre%20o%20modelo%20${encodeURIComponent(m.nome)}%20de%20terceirização.`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl font-black text-sm text-black transition-colors hover:opacity-90"
            style={{ backgroundColor: m.cor }}>
            <PhoneCall className="w-4 h-4" /> Cadastrar meu veículo
          </a>
        </div>

        {/* requisitos + incluso */}
        <div className="space-y-4">
          <div className="bg-card border border-white/10 rounded-2xl p-5">
            <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Requisitos do veículo</p>
            <ul className="space-y-2">
              {m.requisitos.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />{r}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-card border border-white/10 rounded-2xl p-5">
            <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">O que a VaideVan oferece</p>
            <ul className="space-y-2">
              {m.incluso.map((inc, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                  <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />{inc}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* como funciona passos */}
      <div className="bg-card border border-white/10 rounded-2xl p-6">
        <h3 className="font-black text-white mb-5">Como funciona em 4 passos</h3>
        <div className="grid sm:grid-cols-4 gap-4">
          {[
            { n: "01", icon: PhoneCall,    t: "Contato inicial",  d: "Envie as informações do seu veículo pelo WhatsApp." },
            { n: "02", icon: Wrench,       t: "Vistoria e upfit", d: "Inspeção gratuita e customização se necessária." },
            { n: "03", icon: FileText,     t: "Contrato",         d: "Assinatura digital com todas as garantias." },
            { n: "04", icon: TrendingUp,   t: "Retorno mensal",   d: "Transferência automática todo dia 10." },
          ].map(step => {
            const SIcon = step.icon;
            return (
              <div key={step.n} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-primary font-black text-2xl">{step.n}</span>
                  <SIcon className="w-4 h-4 text-white/30" />
                </div>
                <p className="font-black text-white text-sm">{step.t}</p>
                <p className="text-white/40 text-xs leading-relaxed">{step.d}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════ tab: adquirir & operar ══════════════════════════ */
function TabAdquirir() {
  const [showCustom, setShowCustom] = useState(true);
  return (
    <div>
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-6 flex items-start gap-4">
        <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-primary font-black text-sm">Compre, customize e coloque para trabalhar</p>
          <p className="text-white/60 text-sm mt-1">Adquira um veículo seminovo ou novo com suporte VaideVan — conseguimos descontos de frota na concessionária. Fazemos a customização executiva completa e o veículo entra direto na operação com contratos garantidos.</p>
        </div>
      </div>

      {/* toggle customização */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-sm text-white/50">Preços</span>
        <button onClick={() => setShowCustom(!showCustom)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showCustom ? "bg-primary" : "bg-white/10"}`}>
          <span className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${showCustom ? "translate-x-6" : "translate-x-1"}`} />
        </button>
        <span className="text-sm text-white font-bold">
          {showCustom ? "com customização VaideVan" : "valor base do veículo"}
        </span>
      </div>

      <div className="grid lg:grid-cols-4 gap-5 mb-8">
        {veiculos.map(v => (
          <div key={v.id} className={`relative bg-card border rounded-2xl flex flex-col hover:-translate-y-0.5 transition-all ${v.destaque ? "border-violet-400/40 shadow-[0_0_25px_rgba(167,139,250,0.08)]" : "border-white/10"}`}>
            {v.destaque && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-500 text-white text-xs font-black px-4 py-1 rounded-full whitespace-nowrap">
                ⭐ Melhor retorno total
              </div>
            )}
            <div className="p-5 border-b border-white/10">
              <span className={`text-xs font-black rounded-full px-2 py-0.5 ${v.badgeColor} mb-2 inline-block`}>{v.badge}</span>
              <h3 className="font-black text-white text-base leading-tight">{v.nome}</h3>
              <p className="text-xs text-white/40 mt-0.5">{v.tipo}</p>
            </div>
            <div className="p-5 border-b border-white/10 space-y-3">
              <div>
                <p className="text-white/30 text-xs mb-0.5">{showCustom ? "Total com upfit" : "Preço base"}</p>
                <p className="text-2xl font-black" style={{ color: v.cor }}>{fmt(showCustom ? v.total : v.preco)}</p>
                {showCustom && <p className="text-xs text-white/30">inclui R$ {(v.customizacao / 1000).toFixed(0)}k de customização</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-white/30 text-xs mb-0.5">Retorno/mês</p><p className="text-sm font-black text-white">{fmt(v.retornoMin)}–{fmt(v.retornoMax)}</p></div>
                <div><p className="text-white/30 text-xs mb-0.5">ROI a.a. est.</p><p className="text-sm font-black text-primary">{v.roiAnual}</p></div>
                <div><p className="text-white/30 text-xs mb-0.5">Passageiros</p><p className="text-sm font-bold text-white">{v.passageiros} pax</p></div>
                <div><p className="text-white/30 text-xs mb-0.5">Upfit incluso</p><p className="text-xs text-white/50">{showCustom ? "Sim" : "Cotação separada"}</p></div>
              </div>
            </div>
            <div className="p-5 flex-1">
              <p className="text-white/30 text-xs font-bold uppercase tracking-wider mb-2">Customização inclusa</p>
              <ul className="space-y-1.5 mb-3">
                {v.upfit.map((u, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-white/60">
                    <Package className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: v.cor }} />{u}
                  </li>
                ))}
              </ul>
              <div className="mt-3 bg-white/5 rounded-lg p-2.5">
                <p className="text-xs text-white/30">Ideal para</p>
                <p className="text-xs text-white/70 mt-0.5">{v.ideal}</p>
              </div>
            </div>
            <div className="p-5 border-t border-white/10">
              <a href={`https://wa.me/5511999294694?text=Olá!%20Tenho%20interesse%20em%20adquirir%20um%20${encodeURIComponent(v.nome)}%20(${v.tipo})%20pelo%20programa%20VaideVan.`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full h-10 rounded-xl font-black text-xs text-black hover:opacity-90 transition-all"
                style={{ backgroundColor: v.cor }}>
                <CreditCard className="w-3.5 h-3.5" /> Quero adquirir
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* financiamento */}
      <div className="bg-card border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-primary" />
          <h3 className="font-black text-white">Opções de aquisição</h3>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: Wallet,      t: "À vista",               d: "Desconto de 5% adicional sobre o preço de tabela. Melhor ROI desde o primeiro mês.", badge: "Maior retorno",    badgeC: "text-green-400 bg-green-400/10" },
            { icon: CreditCard,  t: "Financiamento parceiro", d: "Parceria com Bradesco e Santander Leasing. A renda da operação cobre até 100% da parcela.", badge: "Parcela se paga", badgeC: "text-primary bg-primary/10" },
            { icon: RefreshCw,   t: "Consórcio VaideVan",     d: "Entre num grupo de consórcio com outros investidores. Carta contemplada = veículo operacional.", badge: "Menor custo",    badgeC: "text-blue-400 bg-blue-400/10" },
          ].map(opt => {
            const OIcon = opt.icon;
            return (
              <div key={opt.t} className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <OIcon className="w-4 h-4 text-primary" />
                  <span className="font-black text-white text-sm">{opt.t}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${opt.badgeC} ml-auto`}>{opt.badge}</span>
                </div>
                <p className="text-xs text-white/50 leading-relaxed">{opt.d}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════ tab: van família flex ══════════════════════════ */
function TabVanFlex() {
  const [diasMes, setDiasMes] = useState(15);
  const receitaDia = 850;
  const receita = diasMes * receitaDia;
  const repasse = receita * 0.75;
  const economiaAnual = repasse * 12;

  return (
    <div>
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5 mb-6 flex items-start gap-4">
        <Home className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-blue-400 font-black text-sm">Sua família usa nos fins de semana — a van trabalha para você de segunda a sexta</p>
          <p className="text-white/60 text-sm mt-1">Com a modalidade Flex, você adquire um Sprinter ou Vito para uso pessoal/familiar. Nos períodos em que a van estiver ociosa, a VaideVan a coloca em operação e você recebe 75% da receita bruta — sem custo adicional de gestão.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* simulador de dias ociosos */}
        <div className="bg-card border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <CalendarCheck className="w-5 h-5 text-blue-400" />
            <h3 className="font-black text-white">Quanto você pode ganhar por mês</h3>
          </div>
          <label className="text-xs font-bold text-white/40 uppercase tracking-wider block mb-2">
            Dias disponíveis para locação por mês: <span className="text-blue-400">{diasMes} dias</span>
          </label>
          <input type="range" min={5} max={25} value={diasMes} onChange={e => setDiasMes(Number(e.target.value))} className="w-full accent-blue-400 mb-4" />

          {/* mini calendário visual */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className={`h-6 w-full rounded text-center text-xs flex items-center justify-center font-bold ${i < diasMes ? "bg-blue-400/20 text-blue-400" : "bg-white/5 text-white/20"}`}>
                {i + 1}
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center bg-white/5 rounded-xl p-3">
              <div>
                <p className="text-xs text-white/40">Receita bruta ({diasMes} dias × R$ 850)</p>
                <p className="text-lg font-black text-white">{fmt(receita)}</p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-white/20" />
            </div>
            <div className="flex justify-between items-center bg-blue-400/10 border border-blue-400/20 rounded-xl p-3">
              <div>
                <p className="text-xs text-blue-400/70">Seu repasse líquido (75%)</p>
                <p className="text-xl font-black text-blue-400">{fmt(repasse)}</p>
              </div>
              <TrendingUp className="w-5 h-5 text-blue-400/50" />
            </div>
            <div className="flex justify-between items-center bg-primary/10 border border-primary/20 rounded-xl p-3">
              <div>
                <p className="text-xs text-primary/70">Economia/renda anual estimada</p>
                <p className="text-xl font-black text-primary">{fmt(economiaAnual)}</p>
              </div>
              <Wallet className="w-5 h-5 text-primary/50" />
            </div>
          </div>
          <p className="text-xs text-white/20 mt-3">* Valor médio de diária corporativa. Pode variar conforme modelo e época.</p>
        </div>

        {/* benefícios + como funciona */}
        <div className="space-y-4">
          <div className="bg-card border border-white/10 rounded-2xl p-5">
            <p className="text-xs font-bold text-white/40 uppercase tracking-wider mb-3">Por que funciona?</p>
            <ul className="space-y-3">
              {[
                { icon: Car,          cor: "#60A5FA", t: "Van se paga sozinha",      d: "A renda dos dias ociosos cobre financiamento, seguro e manutenção." },
                { icon: Shield,       cor: "#34D399", t: "Seguro integral no período",d: "VaideVan contrata cobertura total nos dias de operação." },
                { icon: Users,        cor: "#F5E642", t: "Carteira de clientes pronta",d: "Sem precisar prospectar — contratos corporativos já existem." },
                { icon: CalendarCheck,cor: "#A78BFA", t: "Você controla os dias",     d: "Defina no app quais dias estão disponíveis com 48h de antecedência." },
                { icon: Wallet,       cor: "#FBBF24", t: "Pagamento garantido",        d: "Transferência automática dia 10, sem depender de clientes individuais." },
              ].map(b => {
                const BIcon = b.icon;
                return (
                  <li key={b.t} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: b.cor + "20" }}>
                      <BIcon className="w-4 h-4" style={{ color: b.cor }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{b.t}</p>
                      <p className="text-xs text-white/40 mt-0.5">{b.d}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <a href="https://wa.me/5511999294694?text=Olá!%20Quero%20saber%20mais%20sobre%20a%20modalidade%20Van%20Família%20Flex%20da%20VaideVan."
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-blue-500 text-white font-black text-sm hover:bg-blue-500/90 transition-colors">
            <PhoneCall className="w-4 h-4" /> Quero minha Van Flex
          </a>
        </div>
      </div>

      {/* aviso de risco */}
      <div className="bg-card border border-amber-400/20 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-white/50 leading-relaxed">
          <strong className="text-amber-400">Atenção:</strong> A rentabilidade do modelo Flex depende da disponibilidade efetiva do veículo. Veículos disponíveis por menos de 8 dias/mês podem ter retorno insuficiente para cobrir custos fixos. Recomendamos mínimo de 12 dias/mês. A VaideVan não garante 100% de ocupação nos dias disponibilizados, mas tem média histórica de 84% de aproveitamento.
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════ página principal ══════════════════════════ */
const TABS = [
  { id: "cotas",       label: "Cotas Financeiras",    icon: Wallet,    desc: "A partir de R$ 20.000"     },
  { id: "terceirize",  label: "Terceirize sua Frota",  icon: Car,       desc: "Tem veículo? Rentabilize"  },
  { id: "adquirir",    label: "Adquirir & Operar",     icon: Sparkles,  desc: "Compre, customize e opere" },
  { id: "flex",        label: "Van Família Flex",       icon: Home,      desc: "Uso pessoal + renda"       },
];

export default function Propostas() {
  const [tab, setTab] = useState(0);
  const calcRef = useRef<HTMLDivElement>(null);

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">

        {/* header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <span className="text-primary text-xs font-black tracking-widest uppercase">Vagas abertas — oportunidade limitada</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-white">Modalidades de Investimento</h1>
          <p className="text-white/50 mt-1 max-w-2xl">Invista com capital próprio, terceirize seu veículo, adquira e coloque para operar ou use sua van com a família e monetize os momentos ociosos. 4 formas de capitalizar com a VaideVan.</p>
        </div>

        {/* trust bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {[
            { icon: Shield,        label: "Garantia real",        desc: "Alienação fiduciária"         },
            { icon: BadgePercent,  label: "22–55% a.a. est.",     desc: "Conforme modalidade"          },
            { icon: CalendarCheck, label: "Pagto. dia 10",        desc: "Transferência automática"     },
            { icon: Lock,          label: "20+ anos no mercado",  desc: "Marca registrada, INPI"       },
          ].map(item => {
            const IIcon = item.icon;
            return (
              <div key={item.label} className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-3">
                <IIcon className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-black text-white">{item.label}</p>
                  <p className="text-xs text-white/40 mt-0.5">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* gráficos de mercado — sempre visíveis */}
        <MarketCharts />

        {/* tabs de modalidade */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {TABS.map((t, i) => {
            const TIcon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(i)}
                className={`flex-shrink-0 flex items-center gap-2.5 px-5 py-3 rounded-xl border text-sm font-bold transition-all ${tab === i ? "bg-primary/10 border-primary/50 text-white" : "border-white/10 text-white/50 hover:text-white hover:border-white/20"}`}>
                <TIcon className="w-4 h-4" />
                <div className="text-left">
                  <p className="text-sm font-black leading-none">{t.label}</p>
                  <p className="text-xs text-white/30 mt-0.5">{t.desc}</p>
                </div>
                {tab === i && <div className="ml-1 w-1.5 h-1.5 rounded-full bg-primary" />}
              </button>
            );
          })}
        </div>

        {/* conteúdo da tab */}
        {tab === 0 && <TabCotas calcRef={calcRef} />}
        {tab === 1 && <TabTerceirize />}
        {tab === 2 && <TabAdquirir />}
        {tab === 3 && <TabVanFlex />}

        {/* simulador (apenas na tab cotas) */}
        {tab === 0 && (
          <div ref={calcRef} className="mb-8 scroll-mt-6">
            <Calculadora />
          </div>
        )}

        {/* FAQ */}
        <div className="bg-card border border-white/10 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-5">
            <Info className="w-5 h-5 text-primary" />
            <h2 className="font-black text-white text-xl">Perguntas frequentes</h2>
          </div>
          <div className="space-y-2">
            {faqs.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
          </div>
        </div>

        {/* CTA final */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-primary" />
              <p className="font-black text-white text-lg">Pronto para começar?</p>
            </div>
            <p className="text-white/50 text-sm flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              Consultores disponíveis agora — resposta em minutos.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <a href="https://wa.me/5511999294694?text=Olá!%20Quero%20conhecer%20as%20modalidades%20de%20investimento%20VaideVan."
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-black font-black text-sm hover:bg-primary/90 transition-colors whitespace-nowrap">
              <PhoneCall className="w-4 h-4" /> Falar no WhatsApp
            </a>
            {tab !== 0 && (
              <button onClick={() => setTab(0)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-primary/30 text-primary font-black text-sm hover:bg-primary/10 transition-colors whitespace-nowrap">
                <BarChart3 className="w-4 h-4" /> Ver cotas financeiras
              </button>
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
