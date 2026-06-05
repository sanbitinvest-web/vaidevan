import { useState } from "react";
import { useTranslation } from "react-i18next";
import { waLink, WA_BASE } from "@/lib/waLink";
import { ServiceLayout } from "@/components/ServiceLayout";
import {
  Palette, ShieldCheck, ArrowRight, Phone,
  Sofa, Wind, Wifi, Camera, Wrench,
  CheckCircle2, Plus, Minus, MonitorSpeaker,
} from "lucide-react";


const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Customização de Vans Executivas",
    "provider": {
      "@type": "LocalBusiness",
      "name": "VaideVan",
      "url": "https://vaidevan.com",
      "telephone": "+5511999294694",
      "address": { "@type": "PostalAddress", "addressLocality": "São Paulo", "addressRegion": "SP", "addressCountry": "BR" },
    },
    "description": "Customização completa de vans executivas Mercedes-Benz Sprinter em São Paulo. Projetos Essencial, Executive, JetVan, LimoVan e SpaceLimo — com ou sem blindagem.",
    "areaServed": "BR",
    "serviceType": "Customização e Upfitting de Vans Executivas",
    "url": "https://vaidevan.com/customizacao",
    "offers": [
      { "@type": "Offer", "name": "Faça você mesmo", "priceCurrency": "BRL", "price": "35990" },
      { "@type": "Offer", "name": "Essencial", "priceCurrency": "BRL", "price": "49890" },
      { "@type": "Offer", "name": "Executive", "priceCurrency": "BRL", "price": "48990" },
      { "@type": "Offer", "name": "JetVan", "priceCurrency": "BRL", "price": "45000" },
      { "@type": "Offer", "name": "LimoVan", "priceCurrency": "BRL", "price": "65000" },
      { "@type": "Offer", "name": "SpaceLimo", "priceCurrency": "BRL", "price": "95000" },
      { "@type": "Offer", "name": "Identidade Corporativa", "priceCurrency": "BRL", "price": "68900" },
      { "@type": "Offer", "name": "Ambulância / UTI Móvel", "priceCurrency": "BRL", "price": "69000" },
    ],
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "5.0", "reviewCount": "89", "bestRating": "5" },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://vaidevan.com/" },
      { "@type": "ListItem", "position": 2, "name": "Customização de Vans Executivas", "item": "https://vaidevan.com/customizacao" },
    ],
  },
];

type TierKey = "essencial" | "executive" | "jetvan" | "limovan" | "spacelimo";
type VanModelKey = "sprinter417" | "sprinter517" | "master" | "iveco" | "hiace" | "scudo" | "ambulancia";

interface VanModel {
  id: VanModelKey;
  name: string;
  shortName: string;
  exteriorImage: string;
  badge?: string;
}

const VAN_MODELS: VanModel[] = [
  { id: "sprinter417", name: "Mercedes Benz Sprinter Executive", shortName: "Sprinter", exteriorImage: "/vans/exterior-sprinter417.png", badge: "Principal" },
  { id: "sprinter517", name: "Mercedes Benz Sprinter 517 CDI", shortName: "Sprinter 517", exteriorImage: "/vans/exterior-sprinter517.png" },
  { id: "master", name: "Renault Master L3H2", shortName: "Renault Master", exteriorImage: "/vans/exterior-master.png" },
  { id: "iveco", name: "Iveco Daily", shortName: "Iveco Daily", exteriorImage: "/vans/exterior-iveco.png" },
  { id: "hiace", name: "Toyota HiAce Gran Cabin", shortName: "Toyota HiAce", exteriorImage: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&q=80" },
  { id: "scudo", name: "Fiat Scudo Panorama", shortName: "Fiat Scudo", exteriorImage: "https://images.unsplash.com/photo-1609159334890-8b786c1bb8ea?w=800&auto=format&q=80" },
  { id: "ambulancia", name: "Mercedes Sprinter Ambulância", shortName: "Ambulância", exteriorImage: "/vans/exterior-ambulancia.png", badge: "UTI Móvel" },
];

interface TierConfig {
  id: TierKey;
  label: string;
  tagline: string;
  price: string;
  priceNote: string;
  features: string[];
  accentColor: string;
  interiorImage: string;
}

const TIERS: TierConfig[] = [
  {
    id: "essencial",
    label: "Essencial",
    tagline: "Conforto e qualidade para uso corporativo diário",
    price: "A partir de R$ 49.890",
    priceNote: "Prazo: 10–15 dias úteis",
    accentColor: "#888888",
    interiorImage: "/vans/interior-essencial.png",
    features: [
      "Estofamento em tecido premium",
      "Tapetes 3D moldados a vácuo",
      "Iluminação LED de teto",
      "Climatização de passageiros",
      "Rastreamento GPS embarcado",
    ],
  },
  {
    id: "executive",
    label: "Executive",
    tagline: "Interior premium — couro, LED dourado e acabamento de luxo",
    price: "A partir de R$ 48.990",
    priceNote: "Projeto mais solicitado",
    accentColor: "#F5E642",
    interiorImage: "/vans/interior-executive.png",
    features: [
      "Bancos em couro legítimo costurado à mão",
      "LED ambiental dourado",
      "Persianas elétricas laterais",
      "Tapetes velour premium",
      "Saídas USB por assento",
    ],
  },
  {
    id: "jetvan",
    label: "JetVan",
    tagline: "A experiência de um jato executivo privado — em terra",
    price: "A partir de R$ 45.000",
    priceNote: "Inspirado em business class da aviação",
    accentColor: "#4da6ff",
    interiorImage: "/vans/interior-jetvan.png",
    features: [
      "Poltronas individuais reclináveis (business class)",
      "Parede divisória motorista / cabine",
      "Wi-Fi 4G embarcado dedicado",
      "Telas individuais touchscreen 10\"",
      "LED azul estilo aviação",
      "Mesa retrátil por poltrona",
      "Tomadas 110V + USB-C por assento",
    ],
  },
  {
    id: "limovan",
    label: "LimoVan",
    tagline: "O luxo da limusine no espaço de uma van executiva",
    price: "A partir de R$ 65.000",
    priceNote: "Assentos frente a frente — estilo limousine",
    accentColor: "#C8A84B",
    interiorImage: "/vans/interior-limovan.png",
    features: [
      "Assentos frente a frente em couro nappa",
      "Mesa central iluminada em LED dourado",
      "Frigobar embutido com bebidas incluídas",
      "Teto panorâmico iluminado",
      "Divisória elétrica fumê",
      "Som Bose 360°",
      "Piso em vinil mármore",
    ],
  },
  {
    id: "spacelimo",
    label: "SpaceLimo",
    tagline: "O interior mais exclusivo já criado para uma van no Brasil",
    price: "A partir de R$ 95.000",
    priceNote: "Ultra premium — feito sob medida",
    accentColor: "#a855f7",
    interiorImage: "/vans/interior-spacelimo.png",
    features: [
      "Assentos massageadores em couro nappa",
      "Tela 4K retrátil de 55\"",
      "Sistema cinema Dolby Atmos",
      "Minibar premium com frigobar duplo",
      "Isolamento acústico total (NVH)",
      "Teto panorâmico elétrico",
      "Acabamento madeira nobre + fibra de carbono",
      "Iluminação RGB em 16 milhões de cores",
    ],
  },
];

const PACKAGES = [
  {
    name: "Faça você mesmo",
    price: "A partir de R$ 35.990",
    badge: "DIY",
    highlight: false,
    items: [
      "Kit de materiais premium selecionados",
      "Manual técnico de instalação",
      "Suporte remoto da nossa equipe",
      "Tapetes 3D moldados a vácuo",
      "LED de teto incluso",
      "Prazo de entrega: 5 dias úteis",
    ],
  },
  {
    name: "Essencial",
    price: "A partir de R$ 49.890",
    badge: "Entrada",
    highlight: false,
    items: [
      "Estofamento em tecido premium",
      "Tapetes 3D moldados a vácuo",
      "Iluminação LED de teto",
      "Climatização de passageiros",
      "Rastreamento GPS embarcado",
      "Prazo: 10–15 dias úteis",
    ],
  },
  {
    name: "Executive",
    price: "A partir de R$ 48.990",
    badge: "Mais popular",
    highlight: true,
    items: [
      "Bancos em couro legítimo",
      "Painel de LED ambiental dourado",
      "Persianas laterais elétricas",
      "Tapetes velour premium",
      "Saídas USB por assento",
    ],
  },
  {
    name: "Identidade Corporativa",
    price: "A partir de R$ 68.900",
    badge: "B2B",
    highlight: false,
    items: [
      "Tudo do pacote Executive",
      "Plotagem completa com sua marca",
      "Cores e logotipo em vinil 5 anos",
      "Wi-Fi 4G embarcado",
      "Mesa retrátil central",
      "Câmeras 360° externas",
      "Divisória motorista/passageiro",
    ],
  },
  {
    name: "Ambulância / UTI Móvel",
    price: "A partir de R$ 69.000",
    badge: "Saúde & Resgate",
    highlight: false,
    items: [
      "Conversão certificada pelo INMETRO",
      "Maca ortopédica com fixação homologada",
      "Suporte para cilindro de oxigênio",
      "Iluminação de emergência LED (bar de luz)",
      "Sirene e sinalização visual homologadas",
      "Revestimento lavável antibacteriano",
      "Tomadas 110V/220V para equipamentos médicos",
      "Ar-condicionado independente para carga médica",
    ],
  },
];

const SERVICES = [
  { icon: Sofa, title: "Interior Premium", desc: "Revestimento em couro legítimo, suede ou tecido náutico. Bancos individuais, poltronas reclináveis e acabamento de alto padrão." },
  { icon: Palette, title: "Identidade Corporativa", desc: "Plotagem completa com cores e logomarca da sua empresa. Material vinil de alta durabilidade com garantia de 5 anos." },
  { icon: Wifi, title: "Tecnologia Embarcada", desc: "Wi-Fi 4G, TV 4K, sistema de som premium, câmeras de segurança, carregamento wireless e central multimídia." },
  { icon: Wind, title: "Climatização Avançada", desc: "Ar-condicionado independente para passageiros, teto solar, cortinas elétricas e isolamento térmico profissional." },
  { icon: Camera, title: "Segurança & Rastreio", desc: "Câmeras 360°, alarme com bloqueio remoto, rastreador dedicado e vidros blindados (opcional)." },
  { icon: Wrench, title: "Mecânica & Performance", desc: "Suspensão nivelada, pneus reforçados, freios upgrade e motor revisado para máxima confiabilidade." },
];

function getBriefingWA(tierLabel: string, vanName: string, armored: boolean, lang?: string): string {
  const extra = armored ? (lang?.startsWith("en") ? " with armor" : lang?.startsWith("es") ? " con blindaje" : " com blindagem") : "";
  const msg = lang?.startsWith("en")
    ? `Hi! I'd like to start a Briefing for a ${tierLabel}${extra} customization project on the ${vanName}. Could you send me the 3D rendering and detailed quote?`
    : lang?.startsWith("es")
    ? `¡Hola! Me gustaría iniciar un Briefing para un proyecto de personalización ${tierLabel}${extra} en el vehículo ${vanName}. ¿Pueden enviarme la renderización 3D y el presupuesto detallado?`
    : `Olá! Gostaria de iniciar o Briefing para um projeto de customização ${tierLabel}${extra} no veículo ${vanName}. Pode me enviar a renderização 3D e o orçamento detalhado?`;
  return `${WA_BASE}${encodeURIComponent(msg)}`;
}

export default function Customizacao() {
  const { i18n } = useTranslation();
  const [activeTier, setActiveTier] = useState<TierKey>("executive");
  const [activeVan, setActiveVan] = useState<VanModelKey>("sprinter417");
  const [armored, setArmored] = useState(false);

  const currentTier = TIERS.find(t => t.id === activeTier)!;
  const currentVan = VAN_MODELS.find(v => v.id === activeVan)!;

  return (
    <ServiceLayout
      title="Customização de Vans Executivas | JetVan, LimoVan, SpaceLimo — VaideVan SP"
      description="Customize sua van executiva Mercedes-Benz Sprinter: projetos Essencial, Executive, JetVan, LimoVan e SpaceLimo com ou sem blindagem. Visualização 3D, Briefing e orçamento em 48h."
      canonical="https://vaidevan.com/customizacao"
      keywords="customização van executiva SP, JetVan interior jato executivo, LimoVan limousine van, SpaceLimo ultra premium, upfitting van Mercedes Sprinter, identidade corporativa van, blindagem van executiva, van personalizada São Paulo, projeto 3D van executiva"
      whatsappContext="customization"
      structuredData={structuredData}
      breadcrumbName="Customização de Vans Executivas"
    >
      {/* HERO */}
      <section className="relative py-24 px-4 overflow-hidden" style={{ background: "linear-gradient(135deg,#0a0a0a 0%,#111 60%,#1a1500 100%)" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(245,230,66,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(245,230,66,.4) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_100%,rgba(245,230,66,0.06),transparent)]" />
        <div className="relative container mx-auto max-w-5xl text-center">
          <span className="text-primary text-xs font-black tracking-widest uppercase mb-4 block">Upfitting & Design Exclusivo</span>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black leading-tight mb-6">
            Customização de<br />
            <span className="text-primary">Vans Executivas sob Medida</span>
          </h1>
          <p className="text-white/70 text-base md:text-xl max-w-2xl mx-auto mb-10">
            Do projeto Essencial ao SpaceLimo — transformamos sua van em um espaço único. Visualize o interior em 3D e preencha o Briefing pelo WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4">
            <a href={waLink("customization", i18n.language)} target="_blank" rel="noopener noreferrer">
              <button className="bg-primary text-black font-black rounded-full px-8 py-4 text-base sm:text-lg hover:bg-primary/90 transition-all inline-flex items-center justify-center gap-2 w-full sm:w-auto">
                <Phone className="w-5 h-5" /> Iniciar Briefing pelo WhatsApp
              </button>
            </a>
            <a href="#visual">
              <button className="border border-primary/40 text-primary font-black rounded-full px-8 py-4 text-base sm:text-lg hover:bg-primary hover:text-black transition-all w-full sm:w-auto">
                Escolher meu projeto
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-primary py-10 px-4">
        <div className="container mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-black">
          {[
            { v: "300+", l: "Vans customizadas" },
            { v: "20+", l: "Anos de expertise" },
            { v: "48h", l: "Briefing aprovado" },
            { v: "5 anos", l: "Garantia de serviço" },
          ].map(({ v, l }) => (
            <div key={l}>
              <div className="text-3xl md:text-4xl font-black">{v}</div>
              <div className="text-xs font-bold uppercase tracking-wider opacity-70 mt-1">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* SERVIÇOS */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <span className="text-primary text-xs font-black tracking-widest uppercase mb-3 block text-center">O que oferecemos</span>
          <h2 className="text-3xl md:text-4xl font-black text-center mb-4">Customização completa do seu veículo</h2>
          <p className="text-white/60 text-center max-w-2xl mx-auto mb-14">
            Cada detalhe pensado para elevar o conforto, a imagem e a funcionalidade da sua van executiva.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="group p-6 rounded-2xl bg-card border border-white/10 hover:border-primary/40 hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-black text-white mb-2">{title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VISUAL CONFIGURATOR */}
      <section id="visual" className="py-20 px-4 bg-card">
        <div className="container mx-auto max-w-6xl">
          <span className="text-primary text-xs font-black tracking-widest uppercase mb-3 block text-center">Configurador visual</span>
          <h2 className="text-3xl font-black text-center mb-2">Visualize sua van customizada</h2>
          <p className="text-white/60 text-center max-w-2xl mx-auto mb-10">
            Selecione o modelo do veículo e o nível de customização para visualizar o projeto completo, por dentro e por fora.
          </p>

          {/* Step 1 — Van model selector */}
          <div className="mb-8">
            <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-4 text-center">1. Escolha o modelo do veículo</p>
            <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
              {VAN_MODELS.map(vm => (
                <button
                  key={vm.id}
                  onClick={() => setActiveVan(vm.id)}
                  className="relative rounded-2xl overflow-hidden border-2 transition-all hover:-translate-y-0.5 text-left"
                  style={{ borderColor: activeVan === vm.id ? "#F5E642" : "rgba(255,255,255,0.1)" }}
                >
                  <img src={vm.exteriorImage} alt={vm.shortName} className="w-full aspect-video object-cover" loading="lazy" />
                  <div className="p-2 bg-background/80">
                    <p className="text-white text-xs font-black leading-tight">{vm.shortName}</p>
                  </div>
                  {vm.badge && (
                    <span className="absolute top-1.5 left-1.5 bg-primary text-black text-xs font-black rounded px-1.5 py-0.5 leading-none">{vm.badge}</span>
                  )}
                  {activeVan === vm.id && (
                    <div className="absolute inset-0 border-2 border-primary rounded-2xl pointer-events-none" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2 — Tier tabs */}
          <div className="mb-6">
            <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-4 text-center">2. Escolha o nível de customização</p>
            <div className="flex flex-wrap justify-center gap-2">
              {TIERS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTier(t.id)}
                  className="px-5 py-2.5 rounded-full text-sm font-bold border transition-all"
                  style={activeTier === t.id
                    ? { background: t.accentColor, color: "#000", borderColor: t.accentColor }
                    : { borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.55)" }
                  }
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3 — Armoring toggle */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <span className="text-white/50 text-sm">Sem blindagem</span>
            <button
              onClick={() => setArmored(a => !a)}
              className="relative w-12 h-6 rounded-full transition-colors"
              style={{ background: armored ? "#C8A84B" : "rgba(255,255,255,0.1)" }}
              aria-label="Toggle blindagem"
            >
              <div
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform"
                style={{ left: armored ? "calc(100% - 22px)" : "2px" }}
              />
            </button>
            <span className="text-sm font-bold" style={{ color: armored ? "#C8A84B" : "rgba(255,255,255,0.5)" }}>
              🛡 Com blindagem
            </span>
          </div>

          {/* Photos: exterior + interior */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Exterior */}
            <div>
              <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-black">E</span>
                Exterior — {currentVan.name}
              </p>
              <div className="rounded-2xl overflow-hidden border border-white/10 relative">
                <img
                  src={currentVan.exteriorImage}
                  alt={`${currentVan.name} exterior executivo`}
                  className="w-full aspect-video object-cover"
                />
                {armored && (
                  <div className="absolute top-3 right-3 bg-yellow-600 text-black font-black px-3 py-1 rounded-full text-xs flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> BLINDADO
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <p className="text-white font-black text-sm">{currentVan.name}</p>
                  <p className="text-white/60 text-xs">Exterior executivo {armored ? "· Com blindagem" : ""}</p>
                </div>
              </div>
            </div>

            {/* Interior */}
            <div>
              <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-black">I</span>
                Interior — Nível {currentTier.label}
              </p>
              <div className="rounded-2xl overflow-hidden border border-white/10 relative">
                <img
                  src={currentTier.interiorImage}
                  alt={`Interior ${currentTier.label}`}
                  className="w-full aspect-video object-cover"
                />
                {armored && (
                  <div className="absolute inset-0 pointer-events-none" style={{ border: "3px solid #C8A84B", borderRadius: "1rem", boxShadow: "inset 0 0 30px rgba(200,168,75,0.15)" }} />
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">a partir de</p>
                  <p className="text-primary font-black text-xl leading-tight">{currentTier.price.replace("A partir de ", "")}</p>
                  <p className="text-white/60 text-xs mt-0.5">{currentTier.tagline}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Features + briefing */}
          <div className="grid lg:grid-cols-2 gap-8 mt-6">
            <div>
              <div className="flex items-start justify-between mb-4 gap-4">
                <div>
                  <h3 className="font-black text-white text-xl">{currentTier.label}</h3>
                  <p className="text-white/50 text-sm">{currentTier.tagline}</p>
                </div>
                <span className="text-xs bg-white/5 border border-white/10 text-white/50 rounded-full px-3 py-1 whitespace-nowrap">{currentTier.priceNote}</span>
              </div>
              <ul className="space-y-2">
                {currentTier.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-white/70 text-sm">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: currentTier.accentColor }} />
                    {f}
                  </li>
                ))}
                {armored && (
                  <li className="flex items-start gap-2 text-sm font-bold" style={{ color: "#C8A84B" }}>
                    <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                    Blindagem nível III-A — protege contra projéteis até .44 Magnum
                  </li>
                )}
              </ul>
            </div>

            <div className="space-y-3">
              <div className="p-5 rounded-2xl border" style={{ background: `${currentTier.accentColor}08`, borderColor: `${currentTier.accentColor}25` }}>
                <div className="flex items-center gap-2 mb-2">
                  <MonitorSpeaker className="w-4 h-4" style={{ color: currentTier.accentColor }} />
                  <span className="text-white font-black text-sm">Renderização 3D inclusa no briefing</span>
                </div>
                <p className="text-white/60 text-xs mb-4">
                  Preencha o Briefing pelo WhatsApp — nossa equipe cria a renderização 3D do <strong className="text-white/80">{currentVan.shortName}</strong> no nível <strong className="text-white/80">{currentTier.label}</strong>{armored ? " com blindagem" : ""} sem custo adicional. Orçamento em 48h.
                </p>
                <a href={getBriefingWA(currentTier.label, currentVan.name, armored, i18n.language)} target="_blank" rel="noopener noreferrer">
                  <button
                    className="w-full py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2"
                    style={{ background: currentTier.accentColor, color: "#000" }}
                  >
                    <Phone className="w-4 h-4" /> Iniciar Briefing — {currentTier.label}{armored ? " + Blindagem" : ""}
                  </button>
                </a>
              </div>
              <p className="text-white/30 text-xs text-center">
                {currentVan.shortName} · Projeto 3D sem custo · Orçamento em 48h · Garantia 5 anos
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PACOTES */}
      <section id="pacotes" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <span className="text-primary text-xs font-black tracking-widest uppercase mb-3 block text-center">Planos</span>
          <h2 className="text-3xl md:text-4xl font-black text-center mb-4">Pacotes de customização</h2>
          <p className="text-white/60 text-center max-w-2xl mx-auto mb-14">
            Criamos o projeto ideal para seu veículo. Todos os pacotes incluem instalação, acabamento e garantia de 5 anos nos materiais.
          </p>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-6">
            {PACKAGES.map(pkg => {
              const [prefix, ...rest] = pkg.price.split("R$");
              const priceNum = rest.join("R$");
              return (
              <div key={pkg.name} className={`relative p-8 rounded-2xl border transition-all ${pkg.highlight ? "border-primary bg-primary/5 shadow-[0_0_40px_rgba(245,230,66,0.12)]" : "border-white/10 bg-card hover:border-primary/30"}`}>
                {pkg.badge && (
                  <span className={`absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-black rounded-full px-4 py-1 ${pkg.highlight ? "bg-primary text-black" : "bg-white/10 text-white/70"}`}>
                    {pkg.badge}
                  </span>
                )}
                <h3 className="text-xl font-black text-white mb-2">{pkg.name}</h3>
                <div className="mb-6">
                  <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-0.5">{prefix.trim()}</p>
                  <p className="text-primary font-black text-2xl leading-none">R${priceNum}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {pkg.items.map(item => (
                    <li key={item} className="flex items-start gap-2 text-white/70 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a href={`https://wa.me/5511999294694?text=${encodeURIComponent(`Olá! Tenho interesse no pacote ${pkg.name} de customização.`)}`} target="_blank" rel="noopener noreferrer">
                  <button className={`w-full py-3 rounded-xl font-black text-sm transition-all ${pkg.highlight ? "bg-primary text-black hover:bg-primary/90" : "border border-white/20 text-white hover:border-primary hover:text-primary"}`}>
                    Solicitar orçamento <ArrowRight className="inline w-4 h-4 ml-1" />
                  </button>
                </a>
              </div>
              );
            })}
          </div>
          <p className="text-center text-white/40 text-sm mt-8">Preços variam conforme o modelo do veículo e materiais escolhidos. Solicite orçamento personalizado.</p>
        </div>
      </section>

      {/* PROCESSO */}
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto max-w-5xl">
          <span className="text-primary text-xs font-black tracking-widest uppercase mb-3 block text-center">Como funciona</span>
          <h2 className="text-3xl font-black text-center mb-14">Do Briefing à entrega</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { n: "01", title: "Briefing", desc: "Nos conte sua visão — modelo, projeto (JetVan, LimoVan etc.), blindagem, uso pretendido e orçamento." },
              { n: "02", title: "Projeto 3D", desc: "Nossa equipe apresenta renderização 3D em 48h com lista completa de materiais e prazo." },
              { n: "03", title: "Execução", desc: "Prazo médio de 15 a 30 dias úteis na nossa oficina especializada em São Paulo." },
              { n: "04", title: "Entrega", desc: "Vistoria completa, documentação do upfitting e garantia formal de 5 anos nos materiais." },
            ].map(({ n, title, desc }) => (
              <div key={n} className="p-6 rounded-2xl bg-background border border-white/10">
                <div className="text-4xl font-black text-primary/20 mb-4">{n}</div>
                <h3 className="font-black text-white mb-2">{title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <a href={waLink("customization", i18n.language)} target="_blank" rel="noopener noreferrer">
              <button className="bg-primary text-black font-black rounded-full px-10 py-4 text-lg hover:bg-primary/90 transition-all inline-flex items-center gap-2">
                <Phone className="w-5 h-5" /> Iniciar meu projeto agora
              </button>
            </a>
          </div>
        </div>
      </section>
    </ServiceLayout>
  );
}
