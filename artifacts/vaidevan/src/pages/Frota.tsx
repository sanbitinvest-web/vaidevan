import { ServiceLayout } from "@/components/ServiceLayout";
import { CheckCircle2, Phone, Bus, Car, Shield, Truck, ArrowRight, Users, Zap, Ship } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { waLink, WA_BASE } from "@/lib/waLink";
const WHATSAPP_BASE = WA_BASE;
const IMG = (id: string) =>
  `https://images.unsplash.com/${id}?w=640&auto=format&q=80&fit=crop`;

const WP_FLEET_API = "https://vaidevan.com/wp-json/vaidevan/v1/fleet";
let _wpFleetCache: Record<string, string> | null = null;
async function fetchWpFleetImages(): Promise<Record<string, string>> {
  if (_wpFleetCache) return _wpFleetCache;
  try {
    const r = await fetch(WP_FLEET_API, { signal: AbortSignal.timeout(4000) });
    if (!r.ok) return {};
    const data = await r.json();
    _wpFleetCache = data as Record<string, string>;
    return _wpFleetCache;
  } catch {
    return {};
  }
}

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Frota de Veículos Executivos VaideVan",
    "url": "https://vaidevan.com/frota",
    "numberOfItems": 17,
    "itemListElement": [
      { "@type": "ListItem", "position": 1,  "name": "Mercedes-Benz Sprinter — Van Executiva Premium",         "url": "https://vaidevan.com/frota#sprinter" },
      { "@type": "ListItem", "position": 2,  "name": "Mercedes-Benz Vito / V-Class — Minivan Executiva",       "url": "https://vaidevan.com/frota#vito" },
      { "@type": "ListItem", "position": 3,  "name": "Kia Carnival Blindada — Minivan VIP 8 Lugares",          "url": "https://vaidevan.com/frota#carnival" },
      { "@type": "ListItem", "position": 4,  "name": "VW Tiguan Blindada — SUV Executivo Blindado",            "url": "https://vaidevan.com/frota#tiguan" },
      { "@type": "ListItem", "position": 5,  "name": "Ford Fusion Blindado — Sedã Executivo Blindado",         "url": "https://vaidevan.com/frota#fusion" },
      { "@type": "ListItem", "position": 6,  "name": "Blindado Sedã — Transfer VIP Segurança Máxima",          "url": "https://vaidevan.com/frota#blindado" },
      { "@type": "ListItem", "position": 7,  "name": "Jeep Commander — SUV 7 Lugares Premium",                 "url": "https://vaidevan.com/frota#commander" },
      { "@type": "ListItem", "position": 8,  "name": "Sedã Executivo BMW / Mercedes",                          "url": "https://vaidevan.com/frota#seda" },
      { "@type": "ListItem", "position": 9,  "name": "SUV Executivo por Assinatura",                           "url": "https://vaidevan.com/frota#suv" },
      { "@type": "ListItem", "position": 10, "name": "Mercedes Sprinter Blindada — Van VIP Blindada 10-15 lug","url": "https://vaidevan.com/frota#sprinter-blindada" },
      { "@type": "ListItem", "position": 11, "name": "Microônibus Executivo",                                  "url": "https://vaidevan.com/frota#micro" },
      { "@type": "ListItem", "position": 12, "name": "Microônibus 28 a 32 Lugares",                            "url": "https://vaidevan.com/frota#micro28" },
      { "@type": "ListItem", "position": 13, "name": "Ônibus Executivo de Fretamento",                         "url": "https://vaidevan.com/frota#onibus" },
      { "@type": "ListItem", "position": 14, "name": "Ônibus Executivo 46 Lugares com WC",                     "url": "https://vaidevan.com/frota#onibus46" },
      { "@type": "ListItem", "position": 15, "name": "Ônibus Leito e Semi-leito 21 a 52 Lugares",              "url": "https://vaidevan.com/frota#leito" },
      { "@type": "ListItem", "position": 16, "name": "Limousines Executivas — São Paulo Capital",              "url": "https://vaidevan.com/frota#limo" },
      { "@type": "ListItem", "position": 17, "name": "Reserva de Lancha para Passeio",                         "url": "https://vaidevan.com/frota#lancha" },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Início",              "item": "https://vaidevan.com/" },
      { "@type": "ListItem", "position": 2, "name": "Nossa Frota Completa","item": "https://vaidevan.com/frota" },
    ],
  },
];

interface VehicleModel {
  id: string;
  brand: string;
  model: string;
  type: string;
  tag: string;
  capacity: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  image?: string;
  features: string[];
  ideal: string;
  available: boolean;
  note?: string;
}

const VEHICLES: VehicleModel[] = [
  {
    id: "sprinter",
    brand: "Mercedes-Benz",
    model: "Sprinter Executive",
    type: "Van Executiva Premium",
    tag: "Mais locada",
    capacity: "até 15 passageiros",
    color: "#00A19A",
    icon: Bus,
    image: IMG("photo-1558618047-3c8c76ca7d13"),
    features: [
      "Ar-condicionado independente para passageiros",
      "Rastreamento GPS em tempo real",
      "Motorista uniformizado e treinado",
      "Wi-Fi 4G a bordo (projetos customizados)",
      "Sistema de som JBL (customização)",
      "Bancos reclináveis em couro (customização)",
    ],
    ideal: "Grupos de até 15 pessoas · Transfer aeroporto · Fretamento corporativo · Eventos",
    available: true,
  },
  {
    id: "vito",
    brand: "Mercedes-Benz",
    model: "Vito / V-Class",
    type: "Minivan Executiva",
    tag: "Transfer VIP",
    capacity: "até 8 passageiros",
    color: "#0074D9",
    icon: Car,
    image: IMG("photo-1580273916550-e323be2ae537"),
    features: [
      "Bancos em couro premium",
      "Ar-condicionado dual-zone",
      "Rastreamento GPS",
      "Transfer aeroporto e hotéis",
      "Motorista dedicado",
      "Ambiente discreto e silencioso",
    ],
    ideal: "Transfer VIP · CEOs e delegações · Aeroporto · Pequenos grupos",
    available: true,
  },
  {
    id: "carnival",
    brand: "Kia",
    model: "Carnival Blindada",
    type: "Minivan Executiva Blindada — 8 Lugares",
    tag: "Blindada · 8 lugares",
    capacity: "8 passageiros",
    color: "#1C3557",
    icon: Shield,
    image: IMG("photo-1549317661-bd32c8ce0729"),
    features: [
      "Blindagem nível IIIA — projéteis até .44 Magnum",
      "8 lugares com conforto premium",
      "Bancos em couro rebatíveis individualmente",
      "Ar-condicionado multizona",
      "Motorista especializado em segurança",
      "Rota alternativa anti-sequestro disponível",
    ],
    ideal: "Famílias VIP · Executivos de alto risco · Transfer blindado até 8 pessoas",
    available: true,
    note: "Disponibilidade sujeita à agenda. Consulte antes de reservar.",
  },
  {
    id: "tiguan",
    brand: "Volkswagen",
    model: "Tiguan Blindada",
    type: "SUV Executivo Blindado",
    tag: "SUV Blindado",
    capacity: "até 5 passageiros",
    color: "#1B78C2",
    icon: Shield,
    image: IMG("photo-1606664515524-ed2f786a0bd6"),
    features: [
      "Blindagem nível IIIA certificada",
      "SUV compacto com tração 4Motion",
      "Interior VW premium com couro genuíno",
      "Ar-condicionado climatronic",
      "Motorista treinado em condução defensiva",
      "Disponível para rotina e eventos especiais",
    ],
    ideal: "Executivos · Empresas · Reuniões · Rotina diária blindada",
    available: true,
    note: "Consulte disponibilidade antes de reservar.",
  },
  {
    id: "fusion",
    brand: "Ford",
    model: "Fusion Blindado",
    type: "Sedã Executivo Blindado",
    tag: "Sedã Blindado",
    capacity: "até 4 passageiros",
    color: "#003087",
    icon: Shield,
    image: IMG("photo-1580273916550-e323be2ae537"),
    features: [
      "Blindagem nível IIIA certificada",
      "Sedã executivo elegante e discreto",
      "Interior em couro com climatização automática",
      "Câmera de ré e sensores de estacionamento",
      "Motorista de terno com treinamento de segurança",
      "Ideal para executivos de alto risco",
    ],
    ideal: "Executivos · Diplomatas · Autoridades · Transfer discreto blindado",
    available: true,
    note: "Consulte disponibilidade antes de reservar.",
  },
  {
    id: "blindado",
    brand: "Mercedes / BMW",
    model: "Blindado Nível III-A",
    type: "Transfer Blindado VIP",
    tag: "Segurança máxima",
    capacity: "até 5 passageiros",
    color: "#C8A84B",
    icon: Shield,
    image: IMG("photo-1550355291-bbee04a92027"),
    features: [
      "Blindagem nível III-A (projéteis até .44 Magnum)",
      "C300 Blindado / E300 Blindado / BMW 5 Séries",
      "Motorista especializado em segurança",
      "Comunicação criptografada",
      "Rota alternativa anti-sequestro",
      "Disponível para locação e venda",
    ],
    ideal: "Executivos de alto risco · Autoridades · Diplomatas · Eventos de segurança máxima",
    available: true,
    note: "Disponibilidade sujeita à agenda. Consulte antes de reservar.",
  },
  {
    id: "commander",
    brand: "Jeep",
    model: "Commander",
    type: "SUV 7 Lugares Premium",
    tag: "7 lugares",
    capacity: "7 passageiros",
    color: "#5C4A1E",
    icon: Truck,
    image: IMG("photo-1544636331-e26879cd4d9b"),
    features: [
      "7 lugares em 3 fileiras de bancos",
      "Interior premium com couro genuíno",
      "Ar-condicionado traseiro independente",
      "Capacidade de bagagem ampla",
      "Motorista uniformizado",
      "Ideal para famílias e grupos executivos",
    ],
    ideal: "Famílias · Grupos até 7 · Transfer aeroporto · Viagens interestaduais",
    available: true,
  },
  {
    id: "seda",
    brand: "BMW / Mercedes / Toyota",
    model: "Sedã Executivo",
    type: "Sedã Premium",
    tag: "Passeio executivo",
    capacity: "1 a 4 passageiros",
    color: "#1C69D4",
    icon: Car,
    image: IMG("photo-1549317661-bd32c8ce0729"),
    features: [
      "BMW 320i / Mercedes Classe C / Corolla",
      "Transfer discreto para reuniões",
      "Motorista de gravata",
      "Ar-condicionado",
      "Espaço premium para bagagens",
      "Disponível por assinatura mensal",
    ],
    ideal: "Reuniões executivas · Transfer discreto · Visitas a clientes · Aeroporto privativo",
    available: true,
  },
  {
    id: "suv",
    brand: "Toyota / Land Rover / BMW",
    model: "SUV Executivo",
    type: "SUV Premium — por assinatura",
    tag: "Por assinatura",
    capacity: "até 7 passageiros",
    color: "#8B5CF6",
    icon: Truck,
    image: IMG("photo-1544636331-e26879cd4d9b"),
    features: [
      "Hilux SW4 / Range Rover Sport / BMW X5",
      "Ideal para serras, litoral e estradas",
      "Tração 4×4 em qualquer terreno",
      "Capacidade de bagagens ampla",
      "Assinatura mensal com gestor dedicado",
      "Locação avulsa ou contrato anual",
    ],
    ideal: "Viagens intermunicipais · Eventos em resorts · Equipes em campo · Assinatura empresarial",
    available: true,
  },
  {
    id: "sprinter-blindada",
    brand: "Mercedes-Benz",
    model: "Sprinter Blindada",
    type: "Van VIP Blindada 10–15 Lugares",
    tag: "Van Blindada",
    capacity: "10 a 15 passageiros",
    color: "#1A1A2E",
    icon: Shield,
    image: IMG("photo-1558618047-3c8c76ca7d13"),
    features: [
      "Blindagem nível IIIA em van Mercedes",
      "Capacidade 10 a 15 passageiros",
      "Interior premium com couro e climatização",
      "Rastreamento e comunicação criptografada",
      "Motorista especializado em segurança",
      "Escolta disponível sob demanda",
    ],
    ideal: "Grupos VIP blindados · Delegações · Autoridades · Alta diretoria corporativa",
    available: true,
    note: "Consulte disponibilidade. Escolta disponível mediante contrato.",
  },
  {
    id: "micro",
    brand: "Mercedes / Volare",
    model: "Microônibus Executivo",
    type: "Microônibus de Fretamento",
    tag: "Grupos médios",
    capacity: "até 28 passageiros",
    color: "#E2001A",
    icon: Bus,
    image: IMG("photo-1544620347-c4fd4a3d5957"),
    features: [
      "Sprinter 515 / Volare W9 Executive",
      "Ar-condicionado de grande capacidade",
      "Poltronas reclináveis",
      "Ideal para longa distância",
      "TV embutida (alguns modelos)",
      "Fretamento com ou sem motorista",
    ],
    ideal: "Grupos de empresa · Excursões · Transferes de hotel · Feiras e congressos",
    available: true,
  },
  {
    id: "micro28",
    brand: "Marcopolo / Volare",
    model: "Microônibus 28 a 32 Lugares",
    type: "Microônibus Premium",
    tag: "28–32 lugares",
    capacity: "28 a 32 passageiros",
    color: "#D4380D",
    icon: Bus,
    image: IMG("photo-1570126646281-5ec88111777f"),
    features: [
      "Poltronas semi-leito reclináveis",
      "Ar-condicionado de alta potência",
      "Espaço de bagagem generoso",
      "Tomadas USB e 110V por poltrona",
      "TV LCD e sistema de som",
      "Disponível para fretamento estadual e interestadual",
    ],
    ideal: "Grupos médios · Excursões · Congressos · Fretamento interestadual",
    available: true,
  },
  {
    id: "onibus",
    brand: "Marcopolo / Busscar",
    model: "Ônibus Executivo",
    type: "Ônibus de Fretamento Premium",
    tag: "Grandes grupos",
    capacity: "até 50 passageiros",
    color: "#F7901E",
    icon: Bus,
    image: IMG("photo-1570125909232-eb263c188f7e"),
    features: [
      "Poltronas semi-leito reclináveis",
      "Ar-condicionado de última geração",
      "WC a bordo",
      "Sistema de entretenimento",
      "Porta-malas de grande capacidade",
      "Fretamento interestadual disponível",
    ],
    ideal: "Excursões · Fretamento empresarial · Congressos · Viagens interestaduais",
    available: true,
  },
  {
    id: "onibus46",
    brand: "Marcopolo / Comil",
    model: "Ônibus Executivo 46 Lugares",
    type: "Ônibus Executivo com WC",
    tag: "46 lugares · WC",
    capacity: "46 passageiros",
    color: "#E8803A",
    icon: Bus,
    image: IMG("photo-1561361058-c24e021e5a28"),
    features: [
      "46 poltronas executivas reclináveis",
      "WC completo a bordo",
      "Ar-condicionado de dupla saída",
      "TV 42\" e sistema multimídia",
      "Frigobar e serviço de bordo",
      "Fretamento estadual e interestadual",
    ],
    ideal: "Eventos corporativos · Excursões longas · Formaturas · Fretamento empresarial",
    available: true,
  },
  {
    id: "leito",
    brand: "Busscar / Irizar",
    model: "Ônibus Leito / Semi-leito",
    type: "Ônibus Leito Premium",
    tag: "Leito · 21–52 lug.",
    capacity: "21 a 52 passageiros",
    color: "#1B4080",
    icon: Bus,
    image: IMG("photo-1494976388531-d1058494cdd8"),
    features: [
      "Poltronas leito 180° reclináveis (semi e total)",
      "21 a 52 lugares conforme configuração",
      "WC social e individual por poltrona",
      "Cobertor, travesseiro e necessaire",
      "Sistema de TV individual por poltrona",
      "Fretamento interestadual e rodoviário de luxo",
    ],
    ideal: "Viagens longas · Turismo premium · Excursões overnight · Grupos corporativos",
    available: true,
  },
  {
    id: "limo",
    brand: "Lincoln / Cadillac",
    model: "Limousine Executiva",
    type: "Limousine de Luxo",
    tag: "Apenas SP Capital",
    capacity: "até 10 passageiros",
    color: "#2D1B69",
    icon: Car,
    image: IMG("photo-1601979031925-424e53b6caaa"),
    features: [
      "Modelos: Lincoln Town Car, Cadillac, Rolls-Royce",
      "Interior em couro com iluminação LED",
      "Bar e frigobar completo a bordo",
      "Teto panorâmico (alguns modelos)",
      "Motorista de smoking e luvas brancas",
      "Disponível somente em São Paulo Capital",
    ],
    ideal: "Formaturas · Bodas · Eventos de gala · Aniversários · Casamentos VIP",
    available: true,
    note: "Disponível exclusivamente em São Paulo Capital. Consulte disponibilidade.",
  },
  {
    id: "lancha",
    brand: "Diversas marcas",
    model: "Lancha / Iate Executivo",
    type: "Reserva de Lancha para Passeio",
    tag: "Passeio náutico",
    capacity: "até 12 passageiros",
    color: "#0369A1",
    icon: Ship,
    image: IMG("photo-1540946485063-a40da27545f8"),
    features: [
      "Lanchas e iates de 20 a 60 pés",
      "Marinas: Guarujá, Santos, Angra dos Reis",
      "Com ou sem capitão credenciado",
      "Trilha sonora, bar e gastronomia a bordo",
      "Serviço de transfer terrestre até a marina",
      "Disponível para passeio, eventos e retiro executivo",
    ],
    ideal: "Passeios · Eventos no mar · Aniversários · Retiros executivos · Team building",
    available: true,
    note: "Reserva sujeita a condições climáticas e disponibilidade de embarcação.",
  },
];

function VehicleCard({ v }: { v: VehicleModel }) {
  const Icon = v.icon;
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const isBlindado = v.id.includes("blind") || v.tag.toLowerCase().includes("blind");
  const isEn = lang.startsWith("en");
  const isEs = lang.startsWith("es");
  const escortNote = isBlindado
    ? (isEn ? " Could you also inform about escort availability?" : isEs ? " ¿Pueden informar sobre disponibilidad de escolta?" : " Podem informar sobre disponibilidade de escolta?")
    : "";
  const msg = isEn
    ? `Hi! I'd like a quote for renting the ${v.model} (${v.type}). Capacity: ${v.capacity}.${escortNote}`
    : isEs
    ? `¡Hola! Me gustaría un presupuesto para alquilar el ${v.model} (${v.type}). Capacidad: ${v.capacity}.${escortNote}`
    : `Olá! Gostaria de solicitar um orçamento para locação do ${v.model} (${v.type}). Capacidade: ${v.capacity}.${escortNote}`;
  const wa = `${WHATSAPP_BASE}${encodeURIComponent(msg)}`;

  return (
    <article
      id={v.id}
      className="group relative rounded-2xl border border-white/10 hover:border-white/25 overflow-hidden transition-all hover:-translate-y-1"
      style={{ background: `linear-gradient(135deg, #0a0a0a 0%, ${v.color}0e 100%)` }}
    >
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${v.color}, ${v.color}44)` }} />

      <div
        className="relative h-48 overflow-hidden"
        style={{ background: `linear-gradient(180deg, ${v.color}15 0%, transparent 100%)` }}
      >
        {/* Icon — always present as background/fallback */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ color: `${v.color}35` }}>
          <Icon className="w-28 h-28" />
        </div>

        {/* Real photo overlay */}
        {v.image && (
          <img
            src={v.image}
            alt={`${v.brand} ${v.model}`}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        )}

        {/* Gradient overlay for readability */}
        {v.image && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />
        )}

        {/* VaideVan logo watermark */}
        <img
          src="/logo-black-sm.webp"
          alt="VaideVan"
          width={36}
          height={36}
          className="absolute top-3 right-3 opacity-25 z-10"
          style={{ filter: "brightness(10) saturate(0)" }}
        />

        {/* Tag */}
        <div
          className="absolute top-3 left-3 text-xs font-black rounded-full px-3 py-1 z-10 backdrop-blur-sm"
          style={{
            background: `${v.color}33`,
            color: v.color,
            border: `1px solid ${v.color}55`,
            textShadow: "0 1px 3px rgba(0,0,0,0.8)",
          }}
        >
          {v.tag}
        </div>
      </div>

      <div className="p-6">
        <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-0.5">{v.brand}</p>
        <h3 className="text-xl font-black mb-0.5" style={{ color: v.color }}>{v.model}</h3>
        <p className="text-white/55 text-sm mb-4">{v.type}</p>

        <div className="flex items-center gap-2 mb-4 p-2.5 rounded-xl" style={{ background: `${v.color}10`, border: `1px solid ${v.color}20` }}>
          <Users className="w-4 h-4 flex-shrink-0" style={{ color: v.color }} />
          <span className="text-sm font-black text-white">{v.capacity}</span>
        </div>

        <ul className="space-y-1.5 mb-4">
          {v.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-white/60 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: v.color }} />
              {f}
            </li>
          ))}
        </ul>

        <div className="p-2.5 rounded-xl bg-white/4 border border-white/8 mb-4">
          <p className="text-white/35 text-xs leading-relaxed">
            <span className="font-black text-white/55">Ideal para: </span>
            {v.ideal}
          </p>
        </div>

        {v.note && (
          <p className="text-yellow-400/70 text-xs mb-3">⚠ {v.note}</p>
        )}

        <a href={wa} target="_blank" rel="noopener noreferrer">
          <button
            className="w-full py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2"
            style={{ background: `${v.color}18`, color: v.color, border: `1px solid ${v.color}35` }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = v.color; (e.currentTarget as HTMLButtonElement).style.color = "#000"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = `${v.color}18`; (e.currentTarget as HTMLButtonElement).style.color = v.color; }}
          >
            <Phone className="w-4 h-4" /> Solicitar {v.model}
          </button>
        </a>
      </div>
    </article>
  );
}

export default function Frota() {
  const [wpImages, setWpImages] = useState<Record<string, string>>({});
  useEffect(() => {
    fetchWpFleetImages().then(setWpImages);
  }, []);

  const vehicles = wpImages && Object.keys(wpImages).length > 0
    ? VEHICLES.map(v => wpImages[v.id] ? { ...v, image: wpImages[v.id] } : v)
    : VEHICLES;

  return (
    <ServiceLayout
      title="Frota de Vans, Ônibus, Blindados e Lanchas | VaideVan — 17 Categorias"
      description="Conheça a frota completa VaideVan: Sprinter, Vito, Blindados (Carnival, Tiguan, Fusion, Sprinter), Sedã, SUV, Microônibus, Ônibus Executivo 46 lug., Ônibus Leito, Limousine e Lancha. Motorista profissional em SP e todo o Brasil."
      canonical="https://vaidevan.com/frota"
      keywords="frota van executiva SP, Kia Carnival blindada, VW Tiguan blindada, Ford Fusion blindado, Jeep Commander executivo, Sprinter blindada 15 lugares, microônibus 32 lugares, ônibus executivo 46 lugares WC, ônibus leito semi-leito, limousine SP capital, reserva lancha passeio, van executiva São Paulo"
      whatsappText="Olá! Quero conhecer a frota completa da VaideVan — modelos disponíveis, capacidade e condições de locação (com ou sem motorista). Podem me enviar as opções?"
      structuredData={structuredData}
      breadcrumbName="Nossa Frota Completa"
    >
      {/* HERO */}
      <section className="relative py-24 px-4 overflow-hidden" style={{ background: "linear-gradient(135deg,#0a0a0a 0%,#111 50%,#0a0a0a 100%)" }}>
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url('/fleet-aerial.webp')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "grayscale(80%) brightness(0.3)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/95" />
        <div className="relative container mx-auto max-w-5xl text-center">
          <div className="flex items-center justify-center mb-6">
            <img src="/logo-black-sm.webp" alt="VaideVan" width={64} height={64} className="opacity-90" style={{ filter: "brightness(2) saturate(1.5)" }} />
          </div>
          <span className="text-primary text-xs font-black tracking-widest uppercase mb-4 block">Frota própria homologada</span>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black leading-tight mb-6">
            17 Categorias de Veículos<br />
            <span className="text-primary">Para Cada Necessidade</span>
          </h1>
          <p className="text-white/70 text-base md:text-xl max-w-2xl mx-auto mb-10">
            Van, Sedã, SUV, Blindados, Microônibus, Ônibus Executivo e Leito, Limousine e Lancha — locação premium com ou sem motorista em São Paulo e todo o Brasil. Marca registrada. 20+ anos de mercado.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href={`${WHATSAPP_BASE}${encodeURIComponent("Olá! Gostaria de conhecer a frota completa VaideVan (17 categorias) e solicitar um orçamento. Podem me atender?")}`} target="_blank" rel="noopener noreferrer">
              <button className="bg-primary text-black font-black rounded-full px-8 py-4 text-lg hover:bg-primary/90 transition-all inline-flex items-center gap-2">
                <Phone className="w-5 h-5" /> Solicitar orçamento agora
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-primary py-10 px-4">
        <div className="container mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-black">
          {[
            { v: "17",  l: "Categorias de veículos" },
            { v: "20+", l: "Anos com frota própria" },
            { v: "12",  l: "Estados do Brasil" },
            { v: "49+", l: "Cidades atendidas" },
          ].map(({ v, l }) => (
            <div key={l}>
              <div className="text-3xl md:text-4xl font-black">{v}</div>
              <div className="text-xs font-bold uppercase tracking-wider opacity-70 mt-1">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* VEHICLE CARDS */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <span className="text-primary text-xs font-black tracking-widest uppercase mb-3 block text-center">Frota completa</span>
          <h2 className="text-3xl md:text-4xl font-black text-center mb-4">Todos os 17 modelos disponíveis</h2>
          <p className="text-white/60 text-center max-w-2xl mx-auto mb-14">
            Cada veículo da frota VaideVan é equipado com rastreamento GPS, motorista uniformizado e seguro completo. Todos com a logomarca VaideVan.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vehicles.map(v => <VehicleCard key={v.id} v={v} />)}
          </div>
        </div>
      </section>

      {/* FLEET PHOTO */}
      <section className="py-0 mx-4 mb-20 rounded-3xl overflow-hidden relative">
        <img
          src="/frota-av-paulista.webp"
          alt="Frota VaideVan — Vans Mercedes Sprinter executivas na Zona Sul de São Paulo"
          className="w-full h-72 object-cover"
          loading="lazy"
        />
        {/* Logo overlays on vehicle rooftops */}
        <div className="absolute inset-0 pointer-events-none">
          {[
            { left: "10%", top: "28%" },
            { left: "28%", top: "22%" },
            { left: "47%", top: "20%" },
            { left: "65%", top: "22%" },
            { left: "82%", top: "26%" },
          ].map((pos, i) => (
            <img
              key={i}
              src="/logo-black-sm.webp"
              alt="VaideVan"
              width={28}
              height={28}
              style={{ position: "absolute", left: pos.left, top: pos.top, transform: "translate(-50%,-50%) rotate(-2deg)", filter: "brightness(10) saturate(0)", opacity: 0.85 }}
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
          <div>
            <img src="/logo-black-sm.webp" alt="VaideVan" width={40} height={40} className="mb-2 opacity-90" />
            <p className="text-white font-black">Nossa Frota — Zona Sul</p>
            <p className="text-white/60 text-sm">Vans Mercedes Sprinter all-black com logomarca VaideVan no teto</p>
          </div>
          <span className="text-xs bg-primary text-black font-black px-3 py-1.5 rounded-full">Frota Própria</span>
        </div>
      </section>

      {/* NOT FOUND SECTION */}
      <section className="py-16 px-4 bg-card">
        <div className="container mx-auto max-w-4xl">
          <div className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-8 md:p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
              <Zap className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-4">
              Não encontrou o veículo que <span className="text-primary">procura?</span>
            </h2>
            <p className="text-white/60 max-w-xl mx-auto mb-6">
              Trabalhamos com todos os modelos, marcas e categorias — blindados, SUVs de luxo, conversíveis, acessíveis para cadeirante, ônibus executivos e muito mais. Diga o que você precisa e nossa equipe localiza o veículo ideal.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {["Todas as marcas", "Blindados IIIA", "SUV por assinatura", "Ônibus de luxo", "Acessível cadeirante", "Qualquer rota"].map(tag => (
                <span key={tag} className="text-xs font-bold text-white/55 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">{tag}</span>
              ))}
            </div>
            <a href={`${WHATSAPP_BASE}${encodeURIComponent("Olá! Pesquisei no catálogo da VaideVan e não encontrei o veículo que preciso. Podem verificar disponibilidade e me enviar opções com preço?")}`} target="_blank" rel="noopener noreferrer">
              <button className="bg-primary text-black font-black rounded-full px-8 py-4 hover:bg-primary/90 transition-all inline-flex items-center gap-2">
                <Phone className="w-5 h-5" /> Solicitar veículo específico <ArrowRight className="w-4 h-4" />
              </button>
            </a>
          </div>
        </div>
      </section>
    </ServiceLayout>
  );
}
