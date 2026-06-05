import { Helmet } from "react-helmet-async";
import { Smartphone, Monitor, Star, Download, ChevronRight, Apple, Play } from "lucide-react";

const SCREENSHOTS = [
  {
    id: 1,
    title: "Solicite sua van",
    desc: "Formulário inteligente para cotações em segundos",
    bg: "from-yellow-500/20 to-black",
    accent: "#F5E642",
    icon: "🚐",
    content: (
      <div className="p-4 space-y-3">
        <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Selecione o serviço</div>
        <div className="grid grid-cols-2 gap-2">
          {["✈️ Aeroporto", "🏢 Corporativo", "🎉 Eventos", "🗺️ Tour"].map(s => (
            <div key={s} className={`rounded-lg px-2 py-2 text-[10px] font-bold text-center ${s === "✈️ Aeroporto" ? "bg-[#F5E642] text-black" : "bg-white/10 text-white"}`}>{s}</div>
          ))}
        </div>
        <div className="space-y-2 mt-2">
          <input className="w-full rounded-lg bg-white/10 border border-white/10 text-[10px] text-white/50 px-3 py-2" placeholder="Seu nome" readOnly />
          <input className="w-full rounded-lg bg-white/10 border border-white/10 text-[10px] text-white/50 px-3 py-2" placeholder="+55 (11) 9 9999-9999" readOnly />
        </div>
        <div className="rounded-lg bg-[#F5E642] text-black text-center text-[10px] font-black py-2 mt-2">Solicitar Orçamento Grátis</div>
      </div>
    ),
  },
  {
    id: 2,
    title: "Portal do Investidor",
    desc: "Dashboard exclusivo para seus rendimentos",
    bg: "from-emerald-500/20 to-black",
    accent: "#4ade80",
    icon: "📊",
    content: (
      <div className="p-4 space-y-3">
        <div className="text-[10px] text-white/40 font-semibold">Olá, Ricardo 👋</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Saldo Total", value: "R$ 142.800", color: "text-emerald-400" },
            { label: "Rendimento", value: "+28,4%", color: "text-[#F5E642]" },
            { label: "Contratos", value: "3 ativos", color: "text-white" },
            { label: "Cotas", value: "Executiva", color: "text-purple-400" },
          ].map(c => (
            <div key={c.label} className="rounded-lg bg-white/5 border border-white/10 p-2">
              <div className="text-[9px] text-white/30">{c.label}</div>
              <div className={`text-[11px] font-black ${c.color}`}>{c.value}</div>
            </div>
          ))}
        </div>
        <div className="rounded-lg bg-white/5 border border-white/10 p-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9px] text-white/40">Simulador de Retorno</span>
          </div>
          <div className="flex gap-1 items-end h-10">
            {[40, 55, 48, 65, 60, 72, 68, 80].map((h, i) => (
              <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: i === 7 ? "#4ade80" : "rgba(255,255,255,0.15)" }} />
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    title: "Simulador de Investimento",
    desc: "Projeções em 3 cenários com dados reais",
    bg: "from-blue-500/20 to-black",
    accent: "#22d3ee",
    icon: "💰",
    content: (
      <div className="p-4 space-y-3">
        <div className="text-[10px] text-white font-black">Simulador de Investimento</div>
        <div className="grid grid-cols-3 gap-1">
          {[
            { label: "Pessimista", val: "R$ 24.400", color: "text-orange-400" },
            { label: "Realista", val: "R$ 28.400", color: "text-[#22d3ee]" },
            { label: "Otimista", val: "R$ 35.000", color: "text-emerald-400" },
          ].map(c => (
            <div key={c.label} className="rounded-lg bg-white/5 border border-white/10 p-2 text-center">
              <div className="text-[8px] text-white/30">{c.label}</div>
              <div className={`text-[9px] font-black ${c.color}`}>{c.val}</div>
            </div>
          ))}
        </div>
        <div className="rounded-lg bg-white/5 border border-white/10 p-2">
          <div className="h-14 flex items-end gap-0.5 overflow-hidden">
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="flex-1 rounded-t-sm" style={{
                height: `${20 + i * 2.5 + Math.sin(i * 0.5) * 8}%`,
                background: `rgba(34,211,238,${0.3 + i * 0.028})`,
              }} />
            ))}
          </div>
        </div>
        <div className="text-[9px] text-white/30 text-center">24 meses · R$ 20.000 investidos</div>
        <div className="rounded-lg bg-[#22d3ee] text-black text-center text-[9px] font-black py-1.5">Salvar Simulação</div>
      </div>
    ),
  },
  {
    id: 4,
    title: "Avaliações Reais",
    desc: "10 clientes reais, média 5 estrelas",
    bg: "from-orange-500/20 to-black",
    accent: "#f59e0b",
    icon: "⭐",
    content: (
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#F5E642]/20 flex items-center justify-center text-sm font-black text-[#F5E642]">5,0</div>
          <div>
            <div className="text-[9px] font-black text-white">Google My Business</div>
            <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <span key={i} className="text-[#F5E642] text-[8px]">★</span>)}</div>
          </div>
        </div>
        {[
          { name: "Ricardo A.", txt: "Serviço impecável, pontualidade perfeita!", badge: "✈️ Aeroporto" },
          { name: "Fernanda S.", txt: "A van mais confortável que já utilizei.", badge: "🏢 Corporativo" },
        ].map(r => (
          <div key={r.name} className="rounded-lg bg-white/5 border border-white/10 p-2">
            <div className="flex justify-between items-start">
              <div className="flex gap-1.5 items-center">
                <div className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center text-[7px] font-black text-emerald-400">{r.name[0]}</div>
                <span className="text-[9px] font-semibold text-white">{r.name}</span>
              </div>
              <span className="text-[8px] bg-white/10 rounded px-1.5 py-0.5 text-white/50">{r.badge}</span>
            </div>
            <div className="flex gap-0.5 mt-1">{[...Array(5)].map((_, i) => <span key={i} className="text-[#F5E642] text-[7px]">★</span>)}</div>
            <p className="text-[8px] text-white/60 mt-1">{r.txt}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 5,
    title: "Nossa Frota",
    desc: "Mercedes Sprinter Executive certificada",
    bg: "from-purple-500/20 to-black",
    accent: "#a78bfa",
    icon: "🚐",
    content: (
      <div className="p-4 space-y-3">
        <div className="text-[10px] text-white font-black">Nossa Frota</div>
        <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          <div className="bg-gradient-to-br from-purple-500/20 to-transparent h-16 flex items-center justify-center text-3xl">🚐</div>
          <div className="p-3">
            <div className="text-[10px] font-black text-white">Sprinter Executive</div>
            <div className="text-[8px] text-white/40">2024 · Executive · 15 lugares</div>
            <div className="flex gap-1 mt-2 flex-wrap">
              {["AC", "WiFi", "TV", "USB", "Couro"].map(f => (
                <span key={f} className="bg-purple-500/20 text-purple-300 text-[8px] px-1.5 py-0.5 rounded-full">{f}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {["São Paulo", "Guarulhos", "Campinas"].map(c => (
            <div key={c} className="rounded-lg bg-white/5 border border-white/10 p-1.5 text-center text-[8px] text-white/60">{c}</div>
          ))}
        </div>
        <div className="rounded-lg bg-[#a78bfa] text-white text-center text-[9px] font-black py-1.5">Ver frota completa →</div>
      </div>
    ),
  },
];

function PhoneFrame({ children, accent }: { children: React.ReactNode; accent: string }) {
  return (
    <div className="relative mx-auto" style={{ width: 160 }}>
      <div className="rounded-[28px] border-2 border-white/20 bg-[#0A0A0A] overflow-hidden shadow-2xl" style={{ borderColor: `${accent}40` }}>
        {/* Dynamic island */}
        <div className="bg-black flex items-center justify-center py-1.5">
          <div className="w-12 h-1.5 rounded-full bg-white/20" />
        </div>
        {/* Nav bar com logo real */}
        <div className="bg-[#111] border-b border-white/5 flex items-center justify-between px-3 py-1.5">
          <img src="/logo-vaidevan.webp" alt="VaideVan" className="h-7 w-auto object-contain" />
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
          </div>
        </div>
        <div className="bg-[#0A0A0A] min-h-[280px]">
          {children}
        </div>
        <div className="bg-black flex items-center justify-center py-2">
          <div className="w-6 h-6 rounded-full border border-white/20" />
        </div>
      </div>
    </div>
  );
}

export default function AppScreenshots() {
  return (
    <>
      <Helmet>
        <title>Screenshots do App — VaideVan</title>
        <meta name="description" content="Veja as telas do aplicativo VaideVan para Google Play e Apple App Store. Solicite vans executivas, acesse o portal do investidor e simule seus retornos." />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-[#0A0A0A] text-white">
        {/* Header */}
        <div className="bg-gradient-to-b from-[#F5E642]/10 to-transparent py-16 px-6 text-center">
          <div className="flex justify-center mb-4">
            <img src="/logo-vaidevan.webp" alt="VaideVan" className="w-20 h-20 object-contain shadow-xl shadow-[#F5E642]/20" />
          </div>
          <h1 className="text-4xl font-black mb-2">VaideVan</h1>
          <p className="text-white/60 text-lg mb-6">Transporte Executivo · São Paulo</p>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-[#F5E642] text-[#F5E642]" />)}
              <span className="text-white/70 ml-1 text-sm">5,0 · 10+ avaliações</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/50 text-sm">
              <Download className="w-4 h-4" />
              <span>Disponível em breve nas lojas</span>
            </div>
          </div>

          {/* Store badges */}
          <div className="flex justify-center gap-4 mt-8 flex-wrap">
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-5 py-3 cursor-not-allowed opacity-60">
              <Apple className="w-6 h-6" />
              <div className="text-left">
                <div className="text-xs text-white/60">Em breve na</div>
                <div className="font-bold text-sm">App Store</div>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-5 py-3 cursor-not-allowed opacity-60">
              <Play className="w-5 h-5 fill-current" />
              <div className="text-left">
                <div className="text-xs text-white/60">Em breve no</div>
                <div className="font-bold text-sm">Google Play</div>
              </div>
            </div>
          </div>
        </div>

        {/* Screenshots section */}
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-center gap-2 mb-8">
            <Smartphone className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-black">Screenshots do App</h2>
            <span className="ml-2 text-xs bg-primary/20 text-primary rounded-full px-3 py-1 font-bold">iPhone · Android</span>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
            {SCREENSHOTS.map(s => (
              <div key={s.id} className="flex-shrink-0 w-48 group">
                <div className={`rounded-2xl bg-gradient-to-b ${s.bg} border border-white/10 overflow-hidden mb-3 transition-transform group-hover:-translate-y-2 duration-300`}>
                  <PhoneFrame accent={s.accent}>
                    {s.content}
                  </PhoneFrame>
                </div>
                <div className="text-center">
                  <div className="font-black text-sm text-white">{s.icon} {s.title}</div>
                  <div className="text-xs text-white/40 mt-0.5">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop screenshot */}
          <div className="mt-12">
            <div className="flex items-center gap-2 mb-6">
              <Monitor className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-black">Versão Desktop</h2>
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden p-2">
              <div className="rounded-xl bg-[#0A0A0A] border border-white/10 overflow-hidden">
                {/* Browser chrome */}
                <div className="bg-white/5 border-b border-white/10 px-4 py-2 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  </div>
                  <div className="flex-1 bg-white/10 rounded-md px-3 py-1 text-xs text-white/30 max-w-xs">
                    vaidevan.com
                  </div>
                </div>
                {/* Page mockup */}
                <div className="p-6 space-y-4">
                  <div className="flex gap-6">
                    <div className="flex-1 space-y-3">
                      <div className="text-2xl font-black leading-tight">
                        <span className="text-white">EXECUTIVE VAN RENTAL</span>
                        <br />
                        <span className="text-[#F5E642] italic text-xl">with Driver — VaideVan</span>
                      </div>
                      <div className="text-white/40 text-sm">
                        Mercedes Sprinter in <strong className="text-white/70">Faria Lima, Itaim Bibi</strong> and all of SP.
                        <br />12 states · 49+ cities · 24h B2B charter.
                      </div>
                      <div className="flex gap-2">
                        <div className="bg-white/10 rounded-lg px-3 py-2 text-xs text-white/60">💬 Chat on WhatsApp</div>
                        <div className="bg-[#F5E642] rounded-lg px-3 py-2 text-xs text-black font-bold">📋 Book a Van</div>
                      </div>
                    </div>
                    <div className="w-72 bg-white/5 border border-white/10 rounded-xl p-4 space-y-2 flex-shrink-0">
                      <div className="text-xs text-white/40 font-semibold uppercase">Request Free Quote</div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {["✈️ Airport", "🏢 Corporate", "🎉 Events", "🗺️ Tour"].map(s => (
                          <div key={s} className="bg-white/10 rounded-lg text-[10px] text-white/60 text-center py-2">{s}</div>
                        ))}
                      </div>
                      <div className="bg-white/10 rounded-lg px-2 py-1.5 text-[10px] text-white/30">Your name *</div>
                      <div className="bg-white/10 rounded-lg px-2 py-1.5 text-[10px] text-white/30">WhatsApp *</div>
                      <div className="bg-[#F5E642] rounded-lg text-[10px] font-black text-black text-center py-2">Request Free Quote →</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info section */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {[
              { icon: "📐", title: "Especificações iPhone", items: ["1290 × 2796px — iPhone 15 Pro Max", "1179 × 2556px — iPhone 15 Pro", "1170 × 2532px — iPhone 14", "1125 × 2436px — iPhone 11 Pro"] },
              { icon: "🤖", title: "Especificações Android", items: ["1080 × 1920px — XHDPI", "1440 × 2960px — Samsung S25", "1080 × 2340px — Pixel 8", "1080 × 2400px — Huawei"] },
              { icon: "✅", title: "Assets disponíveis", items: ["Splash screens geradas (/public/splash)", "Ícones PWA 48px→512px", "apple-touch-icon 180×180px", "Maskable icons para Android"] },
            ].map(col => (
              <div key={col.title} className="rounded-2xl bg-white/[0.03] border border-white/10 p-6">
                <div className="text-2xl mb-3">{col.icon}</div>
                <h3 className="font-black text-sm text-white mb-3">{col.title}</h3>
                <ul className="space-y-2">
                  {col.items.map(item => (
                    <li key={item} className="flex items-start gap-2 text-white/50 text-xs">
                      <ChevronRight className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <a href="/" className="inline-flex items-center gap-2 text-primary font-bold text-sm hover:underline">
              ← Voltar para vaidevan.com
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
