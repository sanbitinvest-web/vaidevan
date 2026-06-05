import { useState, useEffect, useLayoutEffect, useRef, useCallback, lazy, Suspense, type ElementType, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
const RouteSimulator = lazy(() =>
  import("@/components/RouteSimulator").then((m) => ({ default: m.RouteSimulator }))
);
import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Helmet } from "react-helmet-async";
import { FAQSchema } from "@/components/FAQSchema";
import { WhatsAppButton } from "@/components/WhatsAppButton";
const ContactForm = lazy(() => import("@/components/ContactForm").then(m => ({ default: m.ContactForm })));
const QuoteModal = lazy(() => import("@/components/QuoteModal").then(m => ({ default: m.QuoteModal })));
const HomeFAQSection = lazy(() => import("@/components/HomeFAQSection"));
const PartnerModal = lazy(() => import("@/components/PartnerModal"));
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Clock,
  ShieldCheck,
  Star,
  Phone,
  Plane,
  Briefcase,
  CalendarDays,
  Bus,
  TrendingUp,
  Award,
  Users,
  Building2,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  Send,
  Loader2,
  Zap,
  X,
  UserPlus,
  Search,
  Lock,
} from "lucide-react";

import { waLink } from "@/lib/waLink";

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let started = false;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started) return;
      started = true;
      obs.disconnect();
      let n = 0;
      const step = Math.ceil(target / (1800 / 16));
      const timer = setInterval(() => {
        n += step;
        if (n >= target) { setCount(target); clearInterval(timer); }
        else setCount(n);
      }, 16);
    }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ── URL base da API (proxy de logos) ─────────────────────────────────────────
const _LOGO_API = ((import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, ""))
  ?? `${import.meta.env.BASE_URL.replace(/\/$/, "")}/api`;

// ── Componente de logo de empresa com proxy server-side ──────────────────────
// Stage 0: Proxy no nosso servidor → busca Clearbit e Google Favicon server-side
// Stage 1: Google Favicon T3 diretamente no browser (backup)
// Stage 2: Texto estilizado (fallback final garantido)
function BrandLogo({ name, clearbit, original }: { name: string; clearbit: string; original?: string }) {
  const [stage, setStage] = useState(0);
  const domain = original ?? clearbit;

  const srcs = [
    `${_LOGO_API}/logo/${clearbit}`,
    `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=128`,
  ];

  return (
    <div className="flex-shrink-0 flex flex-col items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/8 bg-white/5 backdrop-blur-sm min-w-[140px] h-[88px] hover:bg-white/10 transition-all duration-300 group cursor-default">
      {stage < 2 ? (
        <img
          src={srcs[stage]}
          alt={name}
          title={name}
          width={100}
          height={32}
          className="h-7 w-auto max-w-[100px] object-contain opacity-60 group-hover:opacity-100 transition-all duration-300"
          loading="lazy"
          onError={() => setStage(s => Math.min(s + 1, 2))}
        />
      ) : (
        <span className="text-xs font-black tracking-widest text-white/50 group-hover:text-primary transition-colors uppercase text-center leading-tight px-1">{name}</span>
      )}
      <span className="text-[10px] font-semibold tracking-wide text-white/35 group-hover:text-white/60 transition-colors uppercase text-center leading-tight">{name}</span>
    </div>
  );
}

type RevealDir = "up" | "left" | "right" | "scale";
function Reveal({
  as: Tag = "div",
  children,
  className = "",
  delay = 0,
  dir = "up",
}: {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  delay?: number;
  dir?: RevealDir;
}) {
  const ref = useRef<HTMLElement>(null);
  const [v, setV] = useState(false);
  const [animate, setAnimate] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight + 100) {
      setV(true);
      return;
    }
    setAnimate(true);
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setV(true); obs.disconnect(); }
    }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  if (!animate) {
    return (
      <Tag ref={ref} className={className}>
        {children}
      </Tag>
    );
  }

  const base = dir === "left" ? "vv-reveal-left" : dir === "right" ? "vv-reveal-right" : dir === "scale" ? "vv-reveal-scale" : "vv-reveal-up";
  return (
    <Tag ref={ref} className={`${base}${v ? " vv-in" : ""} ${className}`} style={{ transitionDelay: `${delay}s` }}>
      {children}
    </Tag>
  );
}

const HERO_CHIPS_DEF = [
  { icon: Plane, chipKey: "airport" as const, value: "Transfer aeroporto" },
  { icon: Briefcase, chipKey: "corporate" as const, value: "Locação corporativa" },
  { icon: CalendarDays, chipKey: "events" as const, value: "Van para eventos" },
  { icon: Bus, chipKey: "tour" as const, value: "Excursão / passeio" },
];



const GMB_LINK = "https://share.google/368yVbiuzfBWJTcFYDe";
const MAPS_EMBED = "https://maps.google.com/maps?q=VaideVan+Aluguel+de+Vans+Executivas+Av+Pres+Juscelino+Kubitschek+2041+Itaim+Bibi+Sao+Paulo+SP&output=embed&hl=pt-BR";

function MapSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setMapReady(true); obs.disconnect(); } },
      { rootMargin: "300px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="localizacao" className="py-16 px-4 bg-[#0a0a0a] border-t border-white/5">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-10">
          <span className="text-primary text-xs font-black tracking-widest uppercase mb-3 block">Nossa Localização</span>
          <h2 className="text-3xl sm:text-4xl font-black leading-tight mb-3">
            Onde nos <span className="text-primary italic" style={{ fontFamily: "'Syne', sans-serif" }}>Encontrar</span>
          </h2>
          <p className="text-white/50 text-base max-w-xl mx-auto">Itaim Bibi, São Paulo — o coração do mercado executivo paulistano</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          {/* Info cards */}
          <div className="space-y-4">
            {/* Endereço */}
            <div className="rounded-2xl bg-card border border-white/10 p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-primary" aria-hidden="true">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-black text-white text-sm mb-1">Sede São Paulo</p>
                  <p className="text-white/60 text-sm leading-relaxed">
                    Av. Pres. Juscelino Kubitschek, 2041<br />
                    Itaim Bibi — São Paulo, SP 04543-011
                  </p>
                  <a
                    href={GMB_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-primary hover:underline"
                  >
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-primary" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                    Abrir no Google Maps →
                  </a>
                </div>
              </div>
              {/* Rating bar */}
              <div className="flex items-center gap-3 pt-4 mt-4 border-t border-white/10">
                <div className="flex gap-0.5" aria-label="5 estrelas no Google" role="img">
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} viewBox="0 0 24 24" className="w-4 h-4 fill-yellow-400" aria-hidden="true">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
                <span className="font-black text-white text-sm">5.0</span>
                <span className="text-white/40 text-xs">1.000+ avaliações no Google</span>
              </div>
            </div>

            {/* Horários */}
            <div className="rounded-2xl bg-card border border-white/10 p-6">
              <p className="font-black text-white text-sm mb-4 flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-primary flex-shrink-0" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.5 5v5.25l4.5 2.67-.75 1.23L11 13V7h1.5z"/>
                </svg>
                Horário de Atendimento
              </p>
              <div className="space-y-2 text-sm">
                {[
                  { dias: "Segunda – Sexta", horario: "08h00 – 20h00" },
                  { dias: "Sábado – Domingo", horario: "09h00 – 18h00" },
                ].map(({ dias, horario }) => (
                  <div key={dias} className="flex justify-between items-center">
                    <span className="text-white/60">{dias}</span>
                    <span className="text-white font-semibold">{horario}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                  <span className="text-white/60">WhatsApp</span>
                  <span className="text-primary font-black">24h / 7 dias</span>
                </div>
              </div>
            </div>

            {/* GMB CTA */}
            <a
              href={GMB_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-2xl bg-card border border-white/10 p-4 hover:border-primary/40 hover:bg-primary/5 transition-all group"
              aria-label="Ver ficha da VaideVan no Google"
            >
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <div>
                <p className="font-black text-white text-sm group-hover:text-primary transition-colors">Ver Ficha no Google</p>
                <p className="text-white/40 text-xs">Maps · Reviews · Fotos · Rota</p>
              </div>
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white/30 ml-auto group-hover:fill-primary transition-colors" aria-hidden="true">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
              </svg>
            </a>
          </div>

          {/* Mapa lazy-loaded */}
          <div
            ref={containerRef}
            className="rounded-2xl overflow-hidden border border-white/10 min-h-[420px] relative bg-card"
          >
            {!mapReady && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setMapReady(true)}
                role="button"
                tabIndex={0}
                aria-label="Carregar mapa do Google Maps"
                onKeyDown={(e) => e.key === "Enter" && setMapReady(true)}
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-8 h-8 fill-primary" aria-hidden="true">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-white font-bold text-sm">Ver no Mapa</p>
                  <p className="text-white/40 text-xs mt-1">Av. JK, 2041 — Itaim Bibi, SP</p>
                </div>
                <span className="text-xs text-white/30 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                  Clique para carregar o Google Maps
                </span>
              </div>
            )}
            {mapReady && (
              <iframe
                title="VaideVan — Localização Google Maps"
                src={MAPS_EMBED}
                width="100%"
                height="100%"
                style={{ minHeight: 420, border: 0, display: "block",
                  filter: "invert(92%) hue-rotate(180deg) saturate(0.85) brightness(0.95)" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function RouteSimulatorSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const { investor, loading: authLoading } = useAuth();
  const { i18n } = useTranslation();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isApproved = investor?.approvalStatus === "approved";

  return (
    <div ref={ref} className="min-h-[24rem]">
      {!visible || authLoading ? (
        <div className="h-96 rounded-2xl bg-white/5 animate-pulse" aria-hidden="true" />
      ) : isApproved ? (
        <RouteSimulator />
      ) : (
        <div className="rounded-2xl border border-white/10 bg-card p-8 flex flex-col items-center justify-center text-center min-h-64 gap-5">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h3 className="font-black text-white text-xl mb-2">Recurso exclusivo para clientes</h3>
            <p className="text-white/50 text-sm max-w-sm">O simulador de rotas com mapa está disponível apenas para investidores e clientes cadastrados e aprovados pela VaideVan.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/portal">
              <button className="bg-primary text-black font-black rounded-full px-6 py-3 hover:bg-primary/90 transition-all text-sm">
                Entrar no Portal
              </button>
            </Link>
            <a href={waLink("register", i18n.language)} target="_blank" rel="noopener noreferrer">
              <button className="border border-white/20 text-white/70 font-bold rounded-full px-6 py-3 hover:border-primary/50 hover:text-primary transition-all text-sm">
                Solicitar Acesso
              </button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const WHATSAPP_HERO   = waLink("hero",     lang);
  const WHATSAPP_LINK   = waLink("general",  lang);
  const INVESTOR_LINK   = waLink("investor", lang);
  const WHATSAPP_B2B    = waLink("b2b",      lang);
  const WHATSAPP_ROUTE  = waLink("route",    lang);
  const WHATSAPP_FLEET  = waLink("fleet",    lang);
  const WHATSAPP_REG    = waLink("register", lang);

  const [menuOpen, setMenuOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [partnerOpen, setPartnerOpen] = useState(false);
  const [heroService, setHeroService] = useState("Locação corporativa");
  const [heroForm, setHeroForm] = useState({ nome: "", telefone: "", mensagem: "" });
  const [heroStatus, setHeroStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const testimonialsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = testimonialsRef.current;
    if (!el) return;
    let paused = false;
    const onEnter = () => { paused = true; };
    const onLeave = () => { paused = false; };
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("touchstart", onEnter, { passive: true });
    const iv = setInterval(() => {
      if (paused || !el) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (el.scrollLeft >= maxScroll - 4) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: 340, behavior: "smooth" });
      }
    }, 4000);
    return () => {
      clearInterval(iv);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("touchstart", onEnter);
    };
  }, []);

  async function handleHeroSubmit(e: React.FormEvent) {
    e.preventDefault();
    setHeroStatus("loading");
    try {
      const _extApi = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? `${import.meta.env.BASE_URL.replace(/\/$/, "")}/api`;
      const res = await fetch(`${_extApi}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...heroForm, tipo: heroService }),
      });
      if (res.ok) {
        setHeroStatus("success");
      } else {
        throw new Error("erro");
      }
    } catch {
      const msg = `Olá! Me chamo ${heroForm.nome}. Preciso de: ${heroService}. ${heroForm.mensagem} Telefone: ${heroForm.telefone}`;
      window.open(`https://wa.me/5511999294694?text=${encodeURIComponent(msg)}`, "_blank");
      setHeroStatus("success");
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Helmet>
        <title>Aluguel de Van Executiva Premium em SP — com e sem Motorista | VaideVan</title>
        <meta name="description" content="Locação de van executiva Mercedes Sprinter em São Paulo e todo o Brasil. Com ou sem motorista: fretamento corporativo, transfer aeroporto, urgências, família, eventos e excursões. 20+ anos, 12 estados, 49+ cidades. Orçamento em até 1h." />
        <meta name="keywords" content="aluguel van executiva São Paulo, locação van executiva SP, van premium sem motorista SP, van executiva com motorista SP, fretamento van corporativo Faria Lima, van executiva Itaim Bibi, transfer executivo Jardins SP, locação van Berrini, locação van Vila Olímpia, van executiva Brooklin, van corporativa Pinheiros SP, fretamento van Moema, van executiva Higienópolis, locação van Morumbi SP, van executiva Alphaville, transfer aeroporto Guarulhos GRU, transfer aeroporto Congonhas CGH, van para aeroporto Viracopos VCP, contrato mensal van executiva empresa, fretamento corporativo mensal SP nota fiscal, van Mercedes Sprinter aluguel, aluguel van para eventos SP, van urgência SP, van saúde executiva, van família premium SP, van para reuniões executivas São Paulo, VaideVan transporte executivo, van executiva B2B São Paulo, locação van interestadual" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <link rel="canonical" href="https://vaidevan.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vaidevan.com/" />
        <meta property="og:title" content="Aluguel de Van Executiva Premium em SP — com e sem Motorista | VaideVan" />
        <meta property="og:description" content="Locação de van executiva Mercedes Sprinter em SP e todo o Brasil. Com ou sem motorista: fretamento corporativo, transfer aeroporto, urgências, família, eventos e excursões. 20+ anos, 12 estados, 49+ cidades." />
        <meta property="og:image" content="https://vaidevan.com/opengraph.webp" />
        <meta property="og:locale" content={lang === "en" ? "en_US" : lang === "es" ? "es_ES" : "pt_BR"} />
        <meta property="og:site_name" content="VaideVan" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Aluguel de Van Executiva Premium em SP — com e sem Motorista | VaideVan" />
        <meta name="twitter:description" content="Locação de van executiva Mercedes Sprinter em SP. Com ou sem motorista: fretamento corporativo, transfer aeroporto, urgências, família e eventos. 20+ anos, 12 estados, 49+ cidades." />
        <meta name="twitter:image" content="https://vaidevan.com/opengraph.webp" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "VaideVan",
          "description": "Aluguel de vans executivas Mercedes Sprinter em São Paulo e Brasil. Transfer aeroporto, fretamento corporativo, van para eventos. 20+ anos, marca registrada, 12 estados, 49+ cidades.",
          "url": "https://vaidevan.com",
          "logo": "https://vaidevan.com/logo-vaidevan.webp",
          "image": "https://vaidevan.com/opengraph.webp",
          "telephone": "+55-11-99929-4694",
          "email": "contato@vaidevan.com",
          "priceRange": "$$",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Av. Pres. Juscelino Kubitschek, 2041",
            "addressLocality": "São Paulo",
            "addressRegion": "SP",
            "postalCode": "04543-011",
            "addressCountry": "BR"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": -23.578278,
            "longitude": -46.679874
          },
          "hasMap": "https://share.google/368yVbiuzfBWJTcFYDe",
          "openingHoursSpecification": [
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
              "opens": "08:00",
              "closes": "20:00"
            },
            {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": ["Saturday","Sunday"],
              "opens": "09:00",
              "closes": "18:00"
            }
          ],
          "sameAs": [
            "https://www.instagram.com/vaidevanoficial/",
            "https://www.facebook.com/vaidevanoficial/",
            "https://www.linkedin.com/company/vaidevan",
            "https://www.tiktok.com/@vaidevan1",
            "https://br.pinterest.com/vaidevan/",
            "https://x.com/vaidevansempre",
            "https://www.youtube.com/@vaidevanlocadoradeveiculos6655",
            "https://share.google/368yVbiuzfBWJTcFYDe"
          ],
          "areaServed": {
            "@type": "State",
            "name": "São Paulo",
            "containsPlace": [
              {"@type": "City", "name": "São Paulo"},
              {"@type": "City", "name": "Campinas"},
              {"@type": "City", "name": "Santos"},
              {"@type": "City", "name": "Guarulhos"}
            ]
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "5.0",
            "reviewCount": "500",
            "bestRating": "5",
            "worstRating": "1"
          },
          "review": [
            {
              "@type": "Review",
              "author": { "@type": "Person", "name": "Ricardo Almeida" },
              "datePublished": "2026-03-01",
              "reviewBody": "Usamos a VaideVan para transfer diário de executivos do Itaim para o Aeroporto de Congonhas. Pontualidade impecável, vans higienizadas e motoristas uniformizados.",
              "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" }
            },
            {
              "@type": "Review",
              "author": { "@type": "Person", "name": "Fernanda Souza" },
              "datePublished": "2026-02-01",
              "reviewBody": "Contratei a VaideVan para o transfer de toda a equipe no evento anual da empresa. Coordenação perfeita, veículos premium e motorista extremamente atencioso. Economizamos 40% em relação a outras opções.",
              "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" }
            },
            {
              "@type": "Review",
              "author": { "@type": "Person", "name": "Carlos Mendes" },
              "datePublished": "2026-01-01",
              "reviewBody": "Investi na Cota Executiva há 18 meses e o retorno superou as expectativas. A gestão é transparente, recebo relatórios mensais detalhados e o portal do investidor é excelente.",
              "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" }
            },
            {
              "@type": "Review",
              "author": { "@type": "Person", "name": "Ana Paula Ribeiro" },
              "datePublished": "2025-08-01",
              "reviewBody": "Já usei dezenas de serviços de transfer em São Paulo. A VaideVan é outro nível. Van Mercedes Sprinter impecável, motorista chegou 20 minutos antes, água gelada e carregador disponíveis.",
              "reviewRating": { "@type": "Rating", "ratingValue": "5", "bestRating": "5" }
            }
          ]
        })}</script>
      </Helmet>
      <FAQSchema />

      {/* NAVBAR */}
      <header className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">
          <a href="#inicio" aria-label="VaideVan - Início" className="flex-shrink-0">
            <img src="/logo-black-sm.webp" alt="VaideVan - Transporte Executivo" className="h-12 w-auto object-contain" width="48" height="48" />
          </a>
          <nav className="hidden lg:flex flex-1 justify-center items-center gap-5" aria-label="Navegação principal">
            <a href="#inicio" className="text-xs font-semibold hover:text-primary transition-colors whitespace-nowrap">{t("nav.home")}</a>
            <a href="#servicos" className="text-xs font-semibold hover:text-primary transition-colors whitespace-nowrap">{t("nav.services")}</a>
            <a href="#seja-investidor" className="text-xs font-semibold hover:text-primary transition-colors whitespace-nowrap">{t("nav.investor")}</a>
            <a href="#nossa-historia" className="text-xs font-semibold hover:text-primary transition-colors whitespace-nowrap">{t("nav.history")}</a>
            <a href="#depoimentos" className="text-xs font-semibold hover:text-primary transition-colors whitespace-nowrap">{t("nav.reviews")}</a>
            <a href="#faq" className="text-xs font-semibold hover:text-primary transition-colors whitespace-nowrap">{t("nav.faq")}</a>
            <Link href="/compra-venda" className="text-xs font-semibold hover:text-primary transition-colors whitespace-nowrap">{t("nav.buySell")}</Link>
            <Link href="/customizacao" className="text-xs font-semibold hover:text-primary transition-colors whitespace-nowrap">{t("nav.customize")}</Link>
            <Link href="/frota" className="text-xs font-semibold hover:text-primary transition-colors whitespace-nowrap">{t("nav.fleet")}</Link>
            <Link href="/blog" className="text-xs font-semibold hover:text-primary transition-colors whitespace-nowrap">{t("nav.blog")}</Link>
            <LanguageSwitcher />
          </nav>
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0 ml-6">
            <Link href="/portal">
              <Button variant="outline" className="font-bold border-primary text-primary hover:bg-primary hover:text-black rounded-full px-4 text-xs h-9">
                {t("nav.portal")}
              </Button>
            </Link>
            <Button
              onClick={() => setQuoteOpen(true)}
              className="font-bold rounded-full px-4 gap-1.5 bg-primary text-black hover:bg-primary/90 text-xs h-9"
            >
              <Phone className="w-3.5 h-3.5" />
              {t("nav.quote")}
            </Button>
          </div>
          <button
            className="lg:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span className="block w-6 h-0.5 bg-foreground" />
            <span className="block w-6 h-0.5 bg-foreground" />
            <span className="block w-6 h-0.5 bg-foreground" />
          </button>
        </div>
        {menuOpen && (
          <div className="lg:hidden bg-background border-t border-white/10 px-4 py-6 flex flex-col gap-4">
            <a href="#inicio" className="text-sm font-semibold" onClick={() => setMenuOpen(false)}>{t("nav.home")}</a>
            <a href="#servicos" className="text-sm font-semibold" onClick={() => setMenuOpen(false)}>{t("nav.services")}</a>
            <a href="#seja-investidor" className="text-sm font-semibold" onClick={() => setMenuOpen(false)}>{t("nav.investor")}</a>
            <a href="#nossa-historia" className="text-sm font-semibold" onClick={() => setMenuOpen(false)}>{t("nav.history")}</a>
            <a href="#depoimentos" className="text-sm font-semibold" onClick={() => setMenuOpen(false)}>{t("nav.reviews")}</a>
            <a href="#faq" className="text-sm font-semibold" onClick={() => setMenuOpen(false)}>{t("nav.faq")}</a>
            <Link href="/compra-venda" className="text-sm font-semibold text-primary" onClick={() => setMenuOpen(false)}>{t("nav.buySell")}</Link>
            <Link href="/customizacao" className="text-sm font-semibold text-primary" onClick={() => setMenuOpen(false)}>{t("nav.customize")}</Link>
            <Link href="/frota" className="text-sm font-semibold text-primary" onClick={() => setMenuOpen(false)}>{t("nav.fleet")}</Link>
            <Link href="/blog" className="text-sm font-semibold text-primary" onClick={() => setMenuOpen(false)}>{t("nav.blog")}</Link>
            <LanguageSwitcher compact />
            <Button
              onClick={() => { setMenuOpen(false); setQuoteOpen(true); }}
              className="w-full font-bold rounded-full bg-primary text-black"
            >
              {t("nav.quote")}
            </Button>
          </div>
        )}
      </header>

      <main>
        {/* HERO — split layout: copy à esquerda, formulário em destaque à direita */}
        <section
          id="inicio"
          className="relative flex items-start px-4 pt-28 pb-16 overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0a0a0a 0%, #111111 40%, #1a1500 100%)",
          }}
        >
          {/* Grade decorativa de fundo */}
          <div
            className="absolute inset-0 z-0 opacity-10"
            style={{
              backgroundImage: `linear-gradient(rgba(245,230,66,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(245,230,66,0.4) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
          {/* Gradiente radial amarelo à direita (realça o form) */}
          <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_50%_60%_at_75%_50%,rgba(245,230,66,0.06),transparent)]" />

          <div className="relative z-10 w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* ── COLUNA ESQUERDA: Copy ── */}
            <div className="flex flex-col items-start text-left w-full min-w-0">
              {/* Logo — CSS animation (não bloqueia LCP) */}
              <div className="vv-logo-anim mb-4 overflow-visible">
                <img
                  src="/logo-vaidevan.webp"
                  alt="VaideVan — Locação de Vans Executivas Premium em SP"
                  className="h-14 md:h-18 w-auto object-contain"
                  style={{ mixBlendMode: "screen" }}
                  fetchPriority="high"
                  width="80"
                  height="80"
                />
              </div>

              {/* Badge */}
              <div className="vv-badge-anim inline-flex items-center gap-2 border border-primary/60 rounded-full px-3 py-1.5 mb-6 text-[10px] sm:text-xs font-bold tracking-tight sm:tracking-widest text-primary uppercase max-w-full overflow-hidden">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                {t("hero.badge")}
              </div>

              {/* H1 */}
              <h1 className="vv-h1-anim leading-tight mb-5">
                <span
                  className="block text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white"
                  style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.04em" }}
                >
                  {t("hero.h1Line1")}
                </span>
                <span
                  className="block text-xl sm:text-2xl md:text-4xl lg:text-5xl text-primary leading-tight"
                  style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.04em" }}
                >
                  {t("hero.h1Line2")}
                </span>
              </h1>

              <p className="vv-sub-anim text-base md:text-lg text-white/65 mb-8 max-w-lg leading-relaxed"
                dangerouslySetInnerHTML={{ __html: t("hero.sub") }}
              />

              {/* Bullets de confiança */}
              <ul className="vv-cta-anim space-y-3 mb-8 w-full">
                {[
                  { icon: Zap, text: t("hero.bullet1") },
                  { icon: ShieldCheck, text: t("hero.bullet2") },
                  { icon: MapPin, text: t("hero.bullet3") },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3 text-sm text-white/70 w-full min-w-0">
                    <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="min-w-0 break-words">{text}</span>
                  </li>
                ))}
              </ul>

              {/* CTA WhatsApp imediato */}
              <div className="vv-cta-anim flex flex-col sm:flex-row gap-3 flex-wrap">
                <a
                  href={WHATSAPP_HERO}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white font-black rounded-full h-12 px-7 text-sm hover:bg-[#1da851] transition-all shadow-[0_0_20px_rgba(37,211,102,0.25)]"
                >
                  <Phone className="w-4 h-4" /> {t("hero.cta_whatsapp")}
                </a>
                <Link href="/reserva">
                  <button className="h-12 px-7 text-sm font-black rounded-full bg-primary text-black hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(245,230,66,0.2)]">
                    📋 {t("hero.cta_reserve")}
                  </button>
                </Link>
                <a href="#seja-investidor">
                  <button
                    data-testid="hero-cta-investidor"
                    className="h-12 px-7 text-sm font-black rounded-full border border-primary/40 text-primary hover:bg-primary hover:text-black transition-all"
                  >
                    {t("hero.cta_invest")} <TrendingUp className="w-4 h-4 inline ml-1" />
                  </button>
                </a>
              </div>
            </div>

            {/* ── COLUNA DIREITA: Formulário em destaque ── */}
            <div className="vv-form-anim relative">
              {/* Glow amarelo atrás do card */}
              <div className="absolute -inset-3 rounded-3xl bg-primary/10 blur-2xl pointer-events-none" />

              <div
                className="relative rounded-2xl border border-primary/40 bg-[#0f0f0f] p-7 shadow-[0_0_60px_rgba(245,230,66,0.12)]"
              >
                {/* Header do form */}
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <p className="text-primary text-xs font-black tracking-widest uppercase mb-1">{t("hero.form_title")}</p>
                    <h2 className="text-xl font-black text-white leading-snug">
                      {t("hero.form_subtitle")}
                    </h2>
                  </div>
                  <div className="hidden sm:flex items-center gap-1.5 bg-primary/15 border border-primary/30 rounded-full px-3 py-1.5 text-primary text-xs font-black flex-shrink-0 ml-4">
                    <Clock className="w-3 h-3" /> {t("hero.form_response")}
                  </div>
                </div>

                {heroStatus === "success" ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-black mb-2">{t("hero.success_title")}</h3>
                    <p className="text-white/55 text-sm max-w-xs mb-5">{t("hero.success_sub")}</p>
                    <a
                      href={WHATSAPP_HERO}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-primary text-black font-black rounded-full px-6 py-3 text-sm hover:bg-primary/90 transition-all"
                    >
                      <Phone className="w-4 h-4" /> {t("hero.success_cta")}
                    </a>
                  </div>
                ) : (
                  <form onSubmit={handleHeroSubmit} className="space-y-4">
                    {/* Chips de serviço — ação imediata */}
                    <div>
                      <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2.5">{t("hero.form_service")}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {HERO_CHIPS_DEF.map(({ chipKey, icon: Icon, value }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setHeroService(value)}
                            className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-2.5 text-xs sm:text-sm font-bold transition-all ${
                              heroService === value
                                ? "bg-primary text-black border-primary shadow-[0_0_15px_rgba(245,230,66,0.3)]"
                                : "bg-white/5 border-white/10 text-white/70 hover:border-primary/50 hover:text-primary"
                            }`}
                          >
                            <Icon className="w-4 h-4 flex-shrink-0" />
                            {t(`chips.${chipKey}`)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Nome + Telefone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-1.5">{t("hero.form_name")}</label>
                        <input
                          type="text"
                          required
                          value={heroForm.nome}
                          onChange={e => setHeroForm(f => ({ ...f, nome: e.target.value }))}
                          placeholder={t("hero.form_placeholder_name")}
                          className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors placeholder-white/25 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-1.5">{t("hero.form_whatsapp")}</label>
                        <input
                          type="tel"
                          required
                          value={heroForm.telefone}
                          onChange={e => setHeroForm(f => ({ ...f, telefone: e.target.value }))}
                          placeholder={t("hero.form_placeholder_phone")}
                          className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors placeholder-white/25 text-white"
                        />
                      </div>
                    </div>

                    {/* Mensagem */}
                    <div>
                      <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-1.5">{t("hero.form_need")}</label>
                      <textarea
                        required
                        rows={3}
                        value={heroForm.mensagem}
                        onChange={e => setHeroForm(f => ({ ...f, mensagem: e.target.value }))}
                        placeholder={t("hero.form_placeholder_need")}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors placeholder-white/25 text-white resize-none"
                      />
                    </div>

                    {/* Botão submit */}
                    <button
                      type="submit"
                      data-testid="hero-cta-orcamento"
                      disabled={heroStatus === "loading"}
                      className="w-full flex items-center justify-center gap-2 bg-primary text-black font-black rounded-xl py-3.5 text-base hover:bg-primary/90 transition-all shadow-[0_0_25px_rgba(245,230,66,0.2)] disabled:opacity-60"
                    >
                      {heroStatus === "loading" ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> {t("hero.form_sending")}</>
                      ) : (
                        <><Send className="w-4 h-4" /> {t("hero.form_submit")}</>
                      )}
                    </button>

                    <p className="text-white/30 text-xs text-center">{t("hero.form_footer")}</p>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="vv-bounce absolute bottom-6 left-1/2 -translate-x-1/2">
            <ChevronDown className="w-6 h-6 text-white/30" />
          </div>
        </section>

        {/* STATS BAR */}
        <section className="bg-primary py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-black">
              {[
                { value: 20, suffix: t("stats.years"), label: t("stats.yearsSub") },
                { value: 12, suffix: t("stats.states"), label: t("stats.statesSub") },
                { value: 49, suffix: t("stats.cities"), label: t("stats.citiesSub") },
                { value: 100, suffix: "%", label: t("stats.satisfaction") },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <p className="text-3xl md:text-4xl font-black leading-none">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="text-xs font-black opacity-60 uppercase tracking-widest mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ECOSSISTEMA DE SOLUÇÕES */}
        <section className="py-16 px-4 bg-[#0a0a0a] border-b border-white/5">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <span className="text-primary text-xs font-black tracking-[0.25em] uppercase mb-4 block">Nossa Proposta</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4">
                Um Ecossistema Completo de{" "}
                <span className="text-primary">Soluções Executivas</span>
              </h2>
              <p className="text-white/50 text-base max-w-2xl mx-auto leading-relaxed">
                A VaideVan não é apenas transporte. É um ecossistema integrado — frota premium, motoristas treinados, tecnologia de rastreamento e suporte 24h — tudo sob uma única marca registrada.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { icon: "✈", title: "Transfer", sub: "Aeroportos GRU / CGH / VCP", href: "/transfer-aeroporto" },
                { icon: "🏢", title: "Corporativo", sub: "Empresas e locação B2B", href: "/fretamento-corporativo" },
                { icon: "🎯", title: "Eventos", sub: "Corporativos e sociais", href: "/van-para-eventos" },
                { icon: "🗺", title: "Excursões", sub: "Passeios e turismo", href: "/excursoes" },
                { icon: "⭐", title: "VIP", sub: "Transporte executivo", href: "/transporte-executivo" },
                { icon: "📐", title: "Customização", sub: "Interior personalizado", href: "/customizacao" },
              ].map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  className="group flex flex-col items-center text-center gap-3 bg-white/[0.03] border border-white/8 rounded-2xl p-5 hover:bg-primary/10 hover:border-primary/40 transition-all"
                >
                  <span className="text-3xl">{item.icon}</span>
                  <div>
                    <p className="font-black text-sm text-white group-hover:text-primary transition-colors">{item.title}</p>
                    <p className="text-white/40 text-[11px] leading-tight mt-0.5">{item.sub}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* PARCEIROS / CLIENTES */}
        {(() => {
          const ROW1: { name: string; clearbit: string; original?: string }[] = [
            { name: "Petrobras",   clearbit: "petrobras.com",       original: "petrobras.com.br" },
            { name: "Embraer",     clearbit: "embraer.com" },
            { name: "Itaú",        clearbit: "itau.com.br" },
            { name: "Bradesco",    clearbit: "bradesco.com",        original: "bradesco.com.br" },
            { name: "Vale",        clearbit: "vale.com" },
            { name: "Ambev",       clearbit: "ab-inbev.com",        original: "ambev.com.br" },
            { name: "Rede Globo",  clearbit: "globo.com" },
            { name: "Vivo",        clearbit: "telefonica.com.br",   original: "vivo.com.br" },
            { name: "BTG Pactual", clearbit: "btgpactual.com" },
            { name: "WEG",         clearbit: "weg.net" },
            { name: "Natura",      clearbit: "naturaeco.com",       original: "natura.com.br" },
            { name: "Localiza",    clearbit: "localiza.com" },
          ];
          const ROW2: { name: string; clearbit: string; original?: string }[] = [
            { name: "Santander",       clearbit: "santander.com",        original: "santander.com.br" },
            { name: "XP Inc",          clearbit: "xpinc.com",            original: "xpi.com.br" },
            { name: "JBS",             clearbit: "jbs.com",              original: "jbs.com.br" },
            { name: "Magalu",          clearbit: "magazineluiza.com.br" },
            { name: "Totvs",           clearbit: "totvs.com" },
            { name: "Claro",           clearbit: "claro.com.br" },
            { name: "Banco do Brasil", clearbit: "bb.com.br" },
            { name: "Renner",          clearbit: "lojasrenner.com.br" },
            { name: "TIM",             clearbit: "tim.com.br",           original: "tim.it" },
            { name: "Hypera",          clearbit: "hypera.com.br" },
            { name: "Hapvida",         clearbit: "hapvida.com.br" },
            { name: "Porto Seguro",    clearbit: "portoseguro.com",      original: "portoseguro.com.br" },
          ];
          return (
            <section className="py-14 px-4 bg-[#0D0D0D] border-y border-white/5 overflow-hidden">
              <div className="container mx-auto max-w-6xl mb-8 text-center">
                <p className="text-white/30 text-xs font-bold tracking-[0.2em] uppercase">
                  {t("partners.label")}
                </p>
              </div>
              <div className="relative w-full overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-[#0D0D0D] to-transparent pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-[#0D0D0D] to-transparent pointer-events-none" />

                {/* Faixa 1 — rolagem para a esquerda */}
                <div className="flex gap-6 marquee-track mb-5">
                  {[...ROW1, ...ROW1].map((b, i) => (
                    <BrandLogo key={i} name={b.name} clearbit={b.clearbit} original={b.original} />
                  ))}
                </div>

                {/* Faixa 2 — rolagem para a direita (mais lenta) */}
                <div className="flex gap-6 marquee-track-reverse">
                  {[...ROW2, ...ROW2].map((b, i) => (
                    <BrandLogo key={i} name={b.name} clearbit={b.clearbit} original={b.original} />
                  ))}
                </div>
              </div>
            </section>
          );
        })()}

        {/* B2B — REDUÇÃO DE CUSTOS LOGÍSTICOS */}
        <section className="py-0 px-4 bg-[#0a0a0a]">
          <div className="container mx-auto max-w-6xl">
            <Reveal className="relative rounded-3xl overflow-hidden border border-primary/30 bg-gradient-to-br from-[#111200] via-[#1a1800] to-[#0a0a0a]">
              {/* Grade decorativa */}
              <div
                className="absolute inset-0 opacity-[0.07] pointer-events-none"
                style={{
                  backgroundImage: `linear-gradient(rgba(245,230,66,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(245,230,66,0.6) 1px, transparent 1px)`,
                  backgroundSize: "48px 48px",
                }}
              />
              {/* Glow lateral */}
              <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[radial-gradient(ellipse_70%_70%_at_100%_50%,rgba(245,230,66,0.08),transparent)] pointer-events-none" />

              <div className="relative z-10 px-8 py-12 md:px-14 md:py-16 flex flex-col md:flex-row items-start md:items-center gap-10">

                {/* Coluna esquerda — copy */}
                <div className="flex-1 min-w-0">
                  <div className="inline-flex items-center gap-2 bg-primary/15 border border-primary/40 rounded-full px-4 py-1.5 mb-5">
                    <Building2 className="w-4 h-4 text-primary" />
                    <span className="text-primary text-xs font-black tracking-widest uppercase">Soluções B2B para Empresas</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight mb-4">
                    Reduza os custos da sua{" "}
                    <span className="text-primary">logística executiva</span>{" "}
                    em até <span className="text-primary">40%</span>
                  </h2>

                  <p className="text-white/65 text-base md:text-lg leading-relaxed mb-6 max-w-xl">
                    Empresas que migram para a locação VaideVan eliminam frotas próprias, reduzem reembolsos de táxi e ganham controle total — com contrato, nota fiscal e relatórios mensais.
                  </p>

                  {/* Benefícios rápidos */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                    {[
                      { icon: "📋", text: "Contrato mensal com NF e SLA de pontualidade" },
                      { icon: "🚐", text: "Frota própria homologada — sem terceiros" },
                      { icon: "📊", text: "Relatórios e dashboard por centro de custo" },
                      { icon: "⚡", text: "Acionamento imediato para demandas urgentes" },
                    ].map((item) => (
                      <div key={item.text} className="flex items-start gap-3">
                        <span className="text-lg leading-none mt-0.5 flex-shrink-0">{item.icon}</span>
                        <span className="text-white/70 text-sm leading-snug">{item.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                    <a
                      href={WHATSAPP_B2B}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-primary text-black font-black rounded-full py-3.5 px-8 text-sm hover:bg-primary/90 transition-all shadow-[0_0_30px_rgba(245,230,66,0.2)]"
                    >
                      <Phone className="w-4 h-4" />
                      Fale com nossos consultores agora!
                    </a>
                    <a
                      href="/fretamento-corporativo"
                      className="inline-flex items-center justify-center gap-2 border border-primary/40 text-primary font-black rounded-full py-3.5 px-8 text-sm hover:bg-primary/10 transition-all"
                    >
                      Ver soluções corporativas
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Coluna direita — métricas */}
                <div className="flex-shrink-0 w-full md:w-72">
                  <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
                    {[
                      { value: "40%", label: "de redução média em custos de transporte", color: "text-primary" },
                      { value: "24h", label: "de acionamento — qualquer hora, qualquer dia", color: "text-primary" },
                      { value: "NF", label: "nota fiscal garantida em todos os contratos", color: "text-primary" },
                      { value: "100%", label: "rastreamento da frota em tempo real", color: "text-primary" },
                    ].map((m) => (
                      <div key={m.label} className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 hover:border-primary/30 transition-colors">
                        <div className={`text-3xl font-black ${m.color} mb-1`}>{m.value}</div>
                        <div className="text-white/50 text-xs leading-snug">{m.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </Reveal>
          </div>
        </section>

        {/* SLA — DIRETRIZES DE PERFORMANCE B2B */}
        <section className="py-14 px-4 bg-[#070707]">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 text-primary text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full">
                📋 Para Clientes Exigentes &amp; B2B
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mt-4 mb-3">
                Diretrizes de Performance e{" "}
                <span className="text-primary">Acordo de Nível de Serviço</span>
              </h2>
              <p className="text-white/60 text-base max-w-2xl mx-auto">
                Compromissos contratuais — não promessas de marketing. Respaldo jurídico pela{" "}
                <strong className="text-white">Lei 10.406/02</strong> e solidez financeira da{" "}
                <strong className="text-primary">Atende Rent a Car</strong>{" "}
                <span className="text-white/40 font-mono text-xs">(CNPJ 63.931.058/0001-79)</span>.
              </p>
            </div>

            {/* Cards SLA principais */}
            <div className="grid md:grid-cols-3 gap-5 mb-8">
              {[
                {
                  icon: "⏱️",
                  title: "Pontualidade",
                  highlight: "Posicionado 15 min antes",
                  desc: "Motorista chega 15 minutos antes do horário contratado, uniformizado e com veículo vistoriado. Atraso registrado gera crédito automático.",
                  border: "border-primary/30",
                  bg: "from-[#1a1400] to-[#0a0a0a]",
                  gradient: true,
                },
                {
                  icon: "🔄",
                  title: "Contingência",
                  highlight: "Substituição em até 60 min",
                  desc: "Qualquer falha mecânica ou operacional aciona protocolo imediato de substituição. Frota reserva disponível 24h em SP e eixo SP-Jundiaí.",
                  border: "border-white/10",
                  bg: "",
                  gradient: false,
                },
                {
                  icon: "📊",
                  title: "Transparência",
                  highlight: "Laudos mensais de manutenção",
                  desc: "Relatórios mensais de manutenção preventiva em concessionária Mercedes-Benz disponibilizados ao gestor de frota do cliente.",
                  border: "border-white/10",
                  bg: "",
                  gradient: false,
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className={`rounded-2xl border ${item.border} ${item.gradient ? `bg-gradient-to-br ${item.bg}` : "bg-card"} p-6`}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <span className="text-2xl">{item.icon}</span>
                  </div>
                  <h3 className="text-lg font-black text-white mb-1">{item.title}</h3>
                  <p className="text-primary font-black text-sm mb-3">{item.highlight}</p>
                  <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Diferenciais técnicos */}
            <div className="grid md:grid-cols-2 gap-5 mb-8">
              {[
                {
                  icon: "🚐",
                  title: "Frota Exclusiva Mercedes-Benz Sprinter (Nova Série)",
                  desc: "Uso exclusivo de Sprinter última geração, baixo km e manutenção obrigatória em concessionária autorizada. Elimina o risco operacional comum em frotas Renault/Fiat.",
                  highlight: false,
                },
                {
                  icon: "⚖️",
                  title: "Segurança Jurídica — Lei 10.406/02",
                  desc: "Operação 100% amparada pela Lei 10.406/02 (Locação). Agilidade contratual superior ao fretamento tradicional com proteção legal completa para ambas as partes.",
                  highlight: false,
                },
                {
                  icon: "📦",
                  title: "Protocolo Back-to-Back — 8 Passageiros + Carga",
                  desc: "Procedimentos operacionais garantem veículo impecável em configuração mista. Pontos de ancoragem para carga sensível. Inspeção e limpeza obrigatória entre operações.",
                  highlight: false,
                },
                {
                  icon: "🏢",
                  title: "Solidez Corporativa — Braço da Atende Rent a Car",
                  desc: "Lastro financeiro da Atende Locadora (Curitiba), com filiais no Brasil, EUA e Europa. Resiliência comprovada pós-pandemia e operação estável em larga escala.",
                  highlight: true,
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className={`rounded-2xl border flex gap-4 p-6 ${item.highlight ? "border-primary/25 bg-gradient-to-br from-[#1a1400] to-[#0a0a0a]" : "border-white/10 bg-card"}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xl">{item.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-black text-white text-sm mb-1.5">{item.title}</h4>
                    <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                    {item.highlight && (
                      <p className="text-primary/60 text-xs font-mono mt-2">CNPJ: 63.931.058/0001-79</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center">
              <a
                href={WHATSAPP_B2B}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary text-black font-black rounded-full py-4 px-10 text-sm hover:bg-primary/90 transition-all shadow-[0_0_30px_rgba(245,230,66,0.2)]"
              >
                📋 Solicitar proposta com SLA garantido
              </a>
            </div>
          </div>
        </section>

        {/* POR QUE INVESTIR */}
        <section id="nossa-historia" className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <Reveal dir="left">
                <span className="text-primary text-sm font-bold tracking-widest uppercase mb-4 block">{t("history.label")}</span>
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6">
                  {t("history.title")}<br />
                  <span className="text-primary font-extrabold">{t("history.titleHighlight")}</span><br />
                  {t("history.titleSuffix")}
                </h2>
                <p className="text-white/70 text-lg leading-relaxed mb-6">
                  {t("history.p1")}
                </p>
                <p className="text-white/70 text-lg leading-relaxed mb-8">
                  {t("history.p2")}
                </p>
                <div className="flex flex-col gap-3">
                  {[
                    t("history.feat1"),
                    t("history.feat2"),
                    t("history.feat3"),
                    t("history.feat4"),
                    t("history.feat5"),
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-white/80">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </Reveal>

              <Reveal dir="right" className="relative">
                <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-card">
                  <img
                    src="/frota-aerea-vaidevan.webp"
                    alt="VaideVan — Frota Executiva: Sedan, Minivan, Mercedes Sprinter Executive e Ônibus Executivo"
                    className="w-full h-80 object-cover object-top"
                    width="1400"
                    height="764"
                    loading="lazy"
                    decoding="async"
                  />
                  {/* Badge sobre a imagem */}
                  <div className="absolute bottom-6 left-6 right-6 bg-black/80 backdrop-blur-sm rounded-2xl p-4 border border-primary/30">
                    <p className="text-primary font-black text-xl">vaidevan.com</p>
                    <p className="text-white/70 text-sm">A marca que move executivos por todo o Brasil</p>
                  </div>
                </div>
                {/* Card flutuante */}
                <div className="absolute -top-6 -right-6 bg-primary rounded-2xl p-4 shadow-xl hidden md:block">
                  <Award className="w-8 h-8 text-black mb-1" />
                  <p className="text-black font-black text-sm">Marca</p>
                  <p className="text-black font-black text-sm">Registrada</p>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* SEJA INVESTIDOR */}
        <section id="seja-investidor" className="py-16 px-4 bg-card relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_80%_50%,rgba(245,230,66,0.06),transparent)]" />
          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="text-center mb-16">
              <span className="text-primary text-sm font-bold tracking-widest uppercase mb-4 block">{t("invest.label")}</span>
              <h2 className="text-2xl sm:text-4xl md:text-6xl font-black mb-6">
                {t("invest.title")}<br />
                <span className="text-primary">{t("invest.titleHighlight")}</span>
              </h2>
              <p className="text-white/60 text-xl max-w-3xl mx-auto leading-relaxed">
                {t("invest.sub")}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {[
                {
                  icon: TrendingUp,
                  title: t("invest.card1Title"),
                  desc: t("invest.card1Desc"),
                  highlight: t("invest.card1Highlight"),
                },
                {
                  icon: Building2,
                  title: t("invest.card2Title"),
                  desc: t("invest.card2Desc"),
                  highlight: t("invest.card2Highlight"),
                },
                {
                  icon: Users,
                  title: t("invest.card3Title"),
                  desc: t("invest.card3Desc"),
                  highlight: t("invest.card3Highlight"),
                },
              ].map((item, i) => (
                <Reveal key={i} as="article" delay={i * 0.15} className="relative p-8 rounded-3xl bg-background border border-white/10 hover:border-primary/40 transition-all group">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div className="inline-block bg-primary/15 text-primary text-xs font-black rounded-full px-3 py-1 mb-4">
                    {item.highlight}
                  </div>
                  <h3 className="text-xl font-black mb-3">{item.title}</h3>
                  <p className="text-white/60 leading-relaxed">{item.desc}</p>
                </Reveal>
              ))}
            </div>

            {/* COMPARAÇÃO VAN vs IMÓVEL */}
            <div className="mb-16">
              {/* Badge */}
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 text-primary text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full">
                  ✅ Dados reais — não projeções
                </span>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black mt-4 mb-3">
                  Van executiva vs. Imóvel:{" "}
                  <span className="text-primary">qual rende mais na prática?</span>
                </h3>
                <p className="text-white/60 text-base max-w-2xl mx-auto">
                  Comparação baseada em <strong className="text-white">resultados reais</strong> de investidores ativos na VaideVan e dados oficiais do mercado imobiliário (SECOVI-SP, FipeZap, IBGE).
                </p>
              </div>

              {/* Modalidades */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {[
                  { icon: "🚐", title: "Compra de veículo novo", desc: "Você adquire uma van da frota VaideVan. Nós operamos, alugamos e repassamos mensalmente." },
                  { icon: "🔑", title: "Consignação do seu veículo", desc: "Tem uma van ou Sprinter? Após aprovação técnica, consigne conosco e receba renda passiva." },
                ].map((m, i) => (
                  <div key={i} className="flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-2xl p-4 max-w-xs text-left">
                    <span className="text-2xl">{m.icon}</span>
                    <div>
                      <div className="text-sm font-bold text-primary">{m.title}</div>
                      <div className="text-xs text-white/50 leading-relaxed mt-1">{m.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-0 rounded-2xl overflow-hidden mb-6 border border-primary/30">
                {[
                  { label: "Retorno anual comprovado", value: "34–50%", sub: "vs 5–7% imóveis" },
                  { label: "Entrada a partir de", value: "R$ 89k", sub: "vs R$ 400k+ imóvel" },
                  { label: "1º repasse em", value: "30 dias", sub: "vs 6–18 meses imóvel" },
                  { label: "Anos de histórico real", value: "20+", sub: "em 12 estados" },
                ].map((s, i) => (
                  <div key={i} className="bg-primary text-center py-4 px-2 border-r border-black/10 last:border-r-0">
                    <div className="text-2xl font-black text-black leading-none">{s.value}</div>
                    <div className="text-[10px] font-bold text-black/70 uppercase tracking-wide mt-1">{s.label}</div>
                    <div className="text-[10px] text-black/50 mt-0.5">{s.sub}</div>
                  </div>
                ))}
              </div>

              {/* Comparison grid */}
              <div className="grid md:grid-cols-2 gap-5">
                {/* VAN */}
                <div className="rounded-2xl border-2 border-primary overflow-hidden" style={{ background: "linear-gradient(135deg,#1a1400,#1f1900)" }}>
                  <div className="bg-primary px-5 py-3 flex items-center gap-3">
                    <span className="text-2xl">🚐</span>
                    <div className="flex-1">
                      <div className="text-base font-black text-black">Van Executiva VaideVan</div>
                      <div className="text-xs text-black/60">Renda passiva comprovada — gestão 100% nossa</div>
                    </div>
                    <span className="bg-black text-primary text-[10px] font-bold px-3 py-1 rounded-full">✓ RESULTADO REAL</span>
                  </div>
                  <div>
                    {[
                      { icon: "📈", title: "Rentabilidade garantida em contrato", desc: "Não é projeção. É o que nossos investidores recebem mensalmente há mais de 20 anos.", highlight: true },
                      { icon: "💰", title: "2,8% a 4,2% ao mês — pagos todo mês", desc: "Equivale a 34%–50% ao ano. Comprovado no extrato bancário de centenas de investidores.", highlight: true },
                      { icon: "🏢", title: "Gestão 100% pela VaideVan", desc: "Captação de demanda, distribuição de corridas, motoristas, manutenção e repasse. Você só recebe.", highlight: false },
                      { icon: "🚐", title: "Invista em nossa frota de veículos ou consigne o seu", desc: "Enquanto não está em uso, a VaideVan aluga e repassa os ganhos integralmente.", highlight: false },
                      { icon: "📡", title: "Rastreamento e bloqueio 24h/7 dias — sem depender do condutor", desc: "Veículos monitorados e bloqueados remotamente a qualquer momento, sem intervenção do motorista. Segurança total para seu patrimônio.", highlight: false },
                      { icon: "🛡️", title: "Zero burocracia, zero dor de cabeça", desc: "Sem IPTU, condomínio, inquilino inadimplente ou ação de despejo. Renda passiva real.", highlight: false },
                      { icon: "🔄", title: "Saída com recompra garantida", desc: "Liquidez programada com opção de recompra ao término do contrato. Seu ativo, suas regras.", highlight: false },
                    ].map((item, i, arr) => (
                      <div key={i} className={`flex gap-3 px-5 py-3 ${i < arr.length - 1 ? "border-b border-primary/10" : ""} ${item.highlight ? "bg-primary/5" : ""}`}>
                        <span className="text-xl mt-0.5 shrink-0">{item.icon}</span>
                        <div>
                          <div className={`text-sm font-bold mb-0.5 ${item.highlight ? "text-primary" : "text-white/90"}`}>{item.title}</div>
                          <div className="text-xs text-white/50 leading-relaxed">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-5 py-4 border-t border-primary/20">
                    <a href={INVESTOR_LINK} target="_blank" rel="noopener noreferrer" className="block">
                      <button className="w-full bg-primary text-black font-black text-sm py-3 rounded-full hover:bg-primary/90 transition-all">
                        📲 Quero investir — falar com especialista
                      </button>
                    </a>
                  </div>
                </div>

                {/* IMÓVEL */}
                <div className="rounded-2xl border-2 border-white/10 bg-card overflow-hidden">
                  <div className="bg-white/5 px-5 py-3 flex items-center gap-3 border-b border-white/10">
                    <span className="text-2xl">🏠</span>
                    <div className="flex-1">
                      <div className="text-base font-black text-white/60">Imóvel para alugar</div>
                      <div className="text-xs text-white/30">Dados: SECOVI-SP, FipeZap, IBGE</div>
                    </div>
                    <span className="bg-white/5 text-red-400 text-[10px] font-bold px-3 py-1 rounded-full">✗ DESVANTAGENS REAIS</span>
                  </div>
                  <div>
                    {[
                      { icon: "📉", title: "0,4% ao mês de rendimento médio em SP", desc: "Dado real do SECOVI-SP. Leva mais de 20 anos para recuperar o capital — sem contar inflação e custos." },
                      { icon: "🏚️", title: "Vacância média de 12% em SP", desc: "Fonte: FipeZap. Em meses vagos você paga condomínio, IPTU e parcelas sem receber nada." },
                      { icon: "⚖️", title: "Despejo leva até 3 anos na Justiça", desc: "A Lei do Inquilinato protege o devedor. Enquanto o processo corre, você arca com tudo." },
                      { icon: "🔨", title: "15% a 30% da renda bruta vai para custos", desc: "IPTU + condomínio + manutenção + seguro + taxa de administração. Lucro real muito menor." },
                      { icon: "📋", title: "4% a 6% do valor só para comprar", desc: "ITBI + cartório + escritura + advogado. Antes de ganhar R$ 1, você já perdeu R$ 20k–40k." },
                      { icon: "🔒", title: "Capital preso por anos sem liquidez", desc: "Vender um imóvel em SP leva em média 14 meses. Mercado sujeito a ciclos longos." },
                    ].map((item, i, arr) => (
                      <div key={i} className={`flex gap-3 px-5 py-3 ${i < arr.length - 1 ? "border-b border-white/5" : ""}`}>
                        <span className="text-xl mt-0.5 shrink-0">{item.icon}</span>
                        <div>
                          <div className="text-sm font-bold text-red-400 mb-0.5">{item.title}</div>
                          <div className="text-xs text-white/40 leading-relaxed">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-5 py-4 border-t border-white/5 bg-black/20 text-center">
                    <p className="text-white/25 text-xs">🔒 Capital imobilizado · alta burocracia · baixo retorno comprovado</p>
                  </div>
                </div>
              </div>

              {/* Rodapé credibilidade */}
              <div className="text-center mt-6 py-4 border-t border-primary/10">
                <p className="text-white/40 text-sm">
                  <strong className="text-primary">+20 anos</strong> de histórico real de pagamentos ·{" "}
                  <strong className="text-primary">Captação, operação e distribuição</strong> 100% gerenciadas por nós ·{" "}
                  <span>Sua van trabalhando mesmo quando você não precisa dela</span>
                </p>
              </div>
            </div>

            {/* CTA investidor */}
            <Reveal className="text-center bg-primary/5 border border-primary/20 rounded-3xl p-12">
              <h3 className="text-xl sm:text-3xl md:text-4xl font-black mb-4">
                {t("invest.cta_title")}
              </h3>
              <p className="text-white/60 text-lg mb-8 max-w-xl mx-auto">
                {t("invest.cta_sub")}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href={INVESTOR_LINK} target="_blank" rel="noopener noreferrer">
                  <Button
                    size="lg"
                    data-testid="investor-cta-button"
                    className="h-14 px-12 text-lg font-black rounded-full bg-primary text-black hover:bg-primary/90 shadow-[0_0_40px_rgba(245,230,66,0.25)] transition-all"
                  >
                    {t("invest.cta_investor")}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </a>
                <Button
                  size="lg"
                  onClick={() => setPartnerOpen(true)}
                  variant="outline"
                  className="h-14 px-10 text-lg font-black rounded-full border-primary/50 text-primary hover:bg-primary/10 transition-all"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  {t("invest.cta_partner")}
                </Button>
              </div>
              <p className="text-white/40 text-sm mt-4">{t("invest.cta_footer")}</p>
            </Reveal>
          </div>
        </section>

        {/* SERVIÇOS */}
        <section id="servicos" className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <span className="text-primary text-sm font-bold tracking-widest uppercase mb-4 block">{t("services.label2")}</span>
              <h2 className="text-2xl sm:text-4xl md:text-6xl font-black mb-6">
                {t("services.title2")}<br />
                <span className="text-primary">{t("services.title2Highlight")}</span>
              </h2>
              <p className="text-white/60 text-xl max-w-2xl mx-auto">
                {t("services.sub2")}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: t("services.g1Title"), desc: t("services.g1Desc"), icon: Plane },
                { title: t("services.g2Title"), desc: t("services.g2Desc"), icon: Briefcase },
                { title: t("services.g3Title"), desc: t("services.g3Desc"), icon: CalendarDays },
                { title: t("services.g4Title"), desc: t("services.g4Desc"), icon: Bus },
                { title: t("services.g5Title"), desc: t("services.g5Desc"), icon: MapPin },
                { title: t("services.g6Title"), desc: t("services.g6Desc"), icon: MapPin },
              ].map((service, i) => (
                <Reveal key={i} as="article" delay={i * 0.08} className="p-7 rounded-2xl bg-card border border-white/10 hover:border-primary/40 hover:-translate-y-1 transition-all group">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                    <service.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-black mb-2">{service.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{service.desc}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* SIMULADOR DE ROTAS */}
        <section id="simulador-rota" className="py-16 px-4 bg-card relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_0%,rgba(245,230,66,0.04),transparent)]" />
          <div className="container mx-auto max-w-6xl relative z-10">
            <div className="text-center mb-14">
              <span className="text-primary text-sm font-bold tracking-widest uppercase mb-4 block">{t("routes.label")}</span>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black mb-4">
                {t("routes.title")}<br />
                <span className="text-primary">{t("routes.titleHighlight")}</span>
              </h2>
              <p className="text-white/60 text-lg max-w-xl mx-auto">
                {t("routes.sub")}
              </p>
            </div>
            <div className="grid lg:grid-cols-2 gap-10 items-start">
              <RouteSimulatorSection />
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-background border border-white/10">
                  <h3 className="font-black text-white text-lg mb-4">{t("routes.why")}</h3>
                  <ul className="space-y-4">
                    {[
                      { icon: "📍", title: t("routes.r1Title"), desc: t("routes.r1Desc") },
                      { icon: "💰", title: t("routes.r2Title"), desc: t("routes.r2Desc") },
                      { icon: "⚡", title: t("routes.r3Title"), desc: t("routes.r3Desc") },
                      { icon: "🚐", title: t("routes.r4Title"), desc: t("routes.r4Desc") },
                    ].map(({ icon, title, desc }) => (
                      <li key={title} className="flex items-start gap-3">
                        <span className="text-xl shrink-0">{icon}</span>
                        <div>
                          <div className="font-black text-white text-sm">{title}</div>
                          <div className="text-white/50 text-xs leading-relaxed">{desc}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
                  <p className="text-white/70 text-sm leading-relaxed mb-4">
                    Referência nacional em transporte executivo — frota própria homologada, motoristas treinados e operação em 12 estados do Brasil.
                  </p>
                  <a
                    href={WHATSAPP_ROUTE}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <button className="w-full py-3 rounded-xl bg-[#25D366] text-white font-black text-sm hover:bg-[#1da851] transition-all flex items-center justify-center gap-2">
                      <Phone className="w-4 h-4" /> {t("routes.cta_wa")}
                    </button>
                  </a>

                  {/* WhatsApp QR Code */}
                  <div className="mt-5 flex flex-col items-center gap-2">
                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">ou aponte a câmera</p>
                    <a
                      href="https://wa.me/5511999294694"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 rounded-2xl bg-white hover:scale-105 transition-transform"
                      title="Abrir WhatsApp VaideVan"
                      style={{ pointerEvents: "auto" }}
                    >
                      <img
                        src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://wa.me/5511999294694&color=000000&bgcolor=ffffff&qzone=1&format=png"
                        alt="QR Code WhatsApp VaideVan"
                        width={120}
                        height={120}
                        style={{ display: "block", pointerEvents: "none" }}
                      />
                    </a>
                    <p className="text-white/30 text-[10px] text-center">Escaneie para falar no WhatsApp</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FROTA COMPLETA B2B */}
        <section id="frota" className="py-16 px-4 bg-background relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_20%_50%,rgba(245,230,66,0.04),transparent)]" />
          <div className="container mx-auto max-w-6xl relative z-10">

            {/* Header */}
            <div className="text-center mb-16">
              <span className="text-primary text-sm font-bold tracking-widest uppercase mb-4 block">{t("fleet.label")}</span>
              <h2 className="text-2xl sm:text-4xl md:text-6xl font-black mb-6">
                {t("fleet.title")}<br />
                <span className="text-primary">{t("fleet.titleHighlight")}</span>
              </h2>
              <p className="text-white/60 text-xl max-w-3xl mx-auto leading-relaxed">
                {t("fleet.sub")}
              </p>
            </div>

            {/* Cards de Veículos */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
              {[
                {
                  brand: "Mercedes-Benz",
                  model: "Sprinter",
                  capacity: "até 15 passageiros",
                  type: "Van Executiva Premium",
                  tag: "Mais alugada",
                  color: "#00A19A",
                  features: ["Ar-condicionado", "Rastreamento GPS", "Motorista uniformizado", "Wi-Fi a bordo"],
                },
                {
                  brand: "Mercedes-Benz",
                  model: "Vito / V-Class",
                  capacity: "até 8 passageiros",
                  type: "Minivan Executiva",
                  tag: "Transfer VIP",
                  color: "#00A19A",
                  features: ["Bancos em couro", "Ar-condicionado", "Rastreamento GPS", "Transfer aeroporto"],
                },
                {
                  brand: "BMW / Mercedes",
                  model: "Veículo de Passeio",
                  capacity: "1 a 4 passageiros",
                  type: "Sedã Executivo",
                  tag: "Passeio Executivo",
                  color: "#1C69D4",
                  features: ["BMW 320i / Classe C / Corolla", "Transfer discreto", "Motorista dedicado", "Venda e locação"],
                },
                {
                  brand: "Mercedes / BMW",
                  model: "Blindado",
                  capacity: "1 a 5 passageiros",
                  type: "Transfer Blindado VIP",
                  tag: "Segurança Máxima",
                  color: "#C8A84B",
                  features: ["Nível IIIA / III-A", "C300 / E300 / BMW 5 Séries", "Motorista especializado", "Venda e locação"],
                },
                {
                  brand: "Mercedes / Volare",
                  model: "Microônibus",
                  capacity: "até 28 passageiros",
                  type: "Microônibus Executivo",
                  tag: "Grupos Médios",
                  color: "#E2001A",
                  features: ["Sprinter 515 / Volare W9", "Ar-condicionado", "Longa distância", "Locação para grupos"],
                },
                {
                  brand: "Marcopolo / Busscar",
                  model: "Ônibus Executivo",
                  capacity: "até 50 passageiros",
                  type: "Ônibus Executivo",
                  tag: "Grandes Grupos",
                  color: "#F7901E",
                  features: ["Poltronas reclináveis", "Ar-condicionado", "WC a bordo", "Locação e excursões"],
                },
                {
                  brand: "Toyota / Land Rover / BMW",
                  model: "SUV Executivo",
                  capacity: "até 7 passageiros",
                  type: "SUV Premium — por assinatura",
                  tag: "Por assinatura",
                  color: "#8B5CF6",
                  features: ["Hilux SW4 / Range Rover / X5", "Ideal para estradas e serras", "Disponível por assinatura mensal", "Locação avulsa ou contrato"],
                },
              ].map((vehicle, i) => (
                <a key={i} href={`/frota#${["sprinter","vito","seda","blindado","micro","onibus","suv"][i]}`} className="block group">
                <Reveal as="article" delay={i * 0.1} className="relative p-6 rounded-2xl bg-background border border-white/10 hover:border-primary/40 hover:-translate-y-1 transition-all cursor-pointer h-full">
                  {/* Tag */}
                  <div
                    className="inline-block text-xs font-black rounded-full px-3 py-1 mb-4"
                    style={{ backgroundColor: `${vehicle.color}22`, color: vehicle.color }}
                  >
                    {vehicle.tag}
                  </div>

                  {/* Brand + Model */}
                  <div className="mb-4">
                    <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">{vehicle.brand}</p>
                    <h3 className="text-2xl font-black" style={{ color: vehicle.color }}>{vehicle.model}</h3>
                    <p className="text-white/60 text-sm mt-1">{vehicle.type}</p>
                  </div>

                  {/* Capacidade */}
                  <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-white/4 border border-white/8">
                    <Users className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm font-black">{vehicle.capacity}</span>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2">
                    {vehicle.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-white/60 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </Reveal>
                </a>
              ))}
            </div>

            {/* Bloco: Não encontrou o veículo? */}
            <Reveal className="mb-14">
              <div className="relative rounded-3xl overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
                {/* Ícone animado */}
                <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Search className="w-9 h-9 text-primary" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                    </span>
                    <span className="text-primary text-xs font-black tracking-widest uppercase">
                      {lang === "en" ? "Custom vehicle sourcing" : lang === "es" ? "Búsqueda personalizada" : "Busca personalizada de veículos"}
                    </span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-white mb-3">
                    {lang === "en"
                      ? <>Didn't find the vehicle you <span className="text-primary">need?</span></>
                      : lang === "es"
                      ? <>¿No encontró el vehículo que <span className="text-primary">busca?</span></>
                      : <>Não encontrou o veículo que <span className="text-primary">procura?</span></>}
                  </h3>
                  <p className="text-white/60 leading-relaxed max-w-2xl">
                    {lang === "en"
                      ? "We work with all models, brands and categories — armored vehicles, full-size SUVs, convertibles, wheelchair-accessible vehicles, luxury coaches, and more. Tell us what you need and our team will find the perfect vehicle for your trip."
                      : lang === "es"
                      ? "Trabajamos con todos los modelos, marcas y categorías — blindados, SUVs de lujo, descapotables, vehículos adaptados, autobuses ejecutivos y más. Díganos lo que necesita y nuestro equipo encontrará el vehículo perfecto para su viaje."
                      : "Trabalhamos com todos os modelos, marcas e categorias — blindados, SUVs de luxo, conversíveis, acessíveis para cadeirante, ônibus executivos e muito mais. Diga o que você precisa e nossa equipe localiza o veículo ideal para a sua viagem."}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">
                    {(lang === "en"
                      ? ["All brands", "Armored vehicles", "SUV subscription", "Luxury coaches", "Accessible vehicles", "Any route, any occasion"]
                      : lang === "es"
                      ? ["Todas las marcas", "Blindados", "SUV por suscripción", "Autobuses de lujo", "Vehículos adaptados", "Cualquier ruta"]
                      : ["Todas as marcas", "Blindados", "SUV por assinatura", "Ônibus de luxo", "Veículo acessível", "Qualquer rota e ocasião"]
                    ).map((tag, i) => (
                      <span key={i} className="text-xs font-bold text-white/60 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex-shrink-0 flex flex-col gap-3 w-full md:w-auto">
                  <a
                    href={`https://wa.me/5511999294694?text=${encodeURIComponent(
                      lang === "en" ? "Hello! I searched the VaideVan catalog and couldn't find the vehicle I need. Could you check availability and send me options?"
                      : lang === "es" ? "¡Hola! Busqué en el catálogo de VaideVan y no encontré el vehículo que necesito. ¿Pueden verificar disponibilidad y enviarme opciones?"
                      : "Olá! Pesquisei no catálogo da VaideVan e não encontrei o veículo que preciso. Podem verificar a disponibilidade e me enviar opções com preço?"
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-primary text-black font-black rounded-full px-7 py-4 hover:bg-primary/90 transition-all text-sm whitespace-nowrap shadow-[0_0_24px_rgba(245,230,66,0.2)]"
                  >
                    <Phone className="w-4 h-4" />
                    {lang === "en" ? "Request vehicle via WhatsApp" : lang === "es" ? "Solicitar vía WhatsApp" : "Solicitar pelo WhatsApp"}
                  </a>
                  <button
                    onClick={() => setQuoteOpen(true)}
                    className="flex items-center justify-center gap-2 bg-white/5 border border-white/15 text-white/70 font-bold rounded-full px-7 py-3.5 hover:bg-white/10 hover:text-white transition-all text-sm whitespace-nowrap"
                  >
                    {lang === "en" ? "Fill out the form" : lang === "es" ? "Llenar el formulario" : "Preencher formulário"}
                  </button>
                </div>
              </div>
            </Reveal>

            {/* Foto da Frota — Zona Sul */}
            <Reveal className="relative rounded-3xl overflow-hidden mb-20 group">
              <img
                src="/frota-aerea-vaidevan.webp"
                alt="Frota VaideVan — vans Mercedes Sprinter executivas pretas com logomarca no teto, Zona Sul SP"
                className="w-full h-[420px] md:h-[560px] object-cover object-top transition-transform duration-700 group-hover:scale-[1.02]"
                loading="lazy"
                width="1400"
                height="560"
              />
              {/* Logo fiel no teto de cada van */}
              <div className="absolute inset-0 pointer-events-none">
                {[
                  { left: "12%", top: "38%" },
                  { left: "30%", top: "30%" },
                  { left: "50%", top: "27%" },
                  { left: "68%", top: "30%" },
                  { left: "85%", top: "36%" },
                ].map((pos, i) => (
                  <img
                    key={i}
                    src="/logo-vaidevan.webp"
                    alt=""
                    aria-hidden="true"
                    width={72}
                    height={72}
                    style={{ position: "absolute", left: pos.left, top: pos.top, transform: "translate(-50%,-50%)", opacity: 0.92, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.6))" }}
                  />
                ))}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/40 rounded-full px-4 py-1.5 mb-4">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-primary text-xs font-black tracking-widest uppercase">{t("fleet.ownFleet")}</span>
                </div>
                <h3 className="text-2xl md:text-4xl font-black text-white mb-2">
                  {t("fleet.paulistaTitle")} <span className="text-primary">Zona Sul</span>
                </h3>
                <p className="text-white/60 text-sm md:text-base max-w-lg">
                  {t("fleet.paulistaSub")}
                </p>
              </div>
            </Reveal>

            {/* B2B Section */}
            <div className="bg-background border border-white/10 rounded-3xl p-5 sm:p-8 md:p-14">
              <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                <div>
                  <span className="text-primary text-xs font-black tracking-[0.2em] uppercase mb-4 block">Soluções B2B</span>
                  <h3 className="text-xl sm:text-3xl md:text-4xl font-black mb-6 leading-tight">
                    Locação de Frotas Executivas para<br />
                    <span className="text-primary">Empresas e Contratos Corporativos</span>
                  </h3>
                  <p className="text-white/60 leading-relaxed mb-6">
                    A VaideVan é a parceira ideal para empresas que precisam de transporte executivo recorrente. Oferecemos contratos B2B com faturamento, NF, SLA e gestor de frota dedicado.
                  </p>
                  <div className="space-y-3 mb-8">
                    {[
                      "Contratos mensais e anuais com nota fiscal",
                      "Frota dedicada com motorista fixo por empresa",
                      "Relatórios de uso e gestão de frotas",
                      "SLA garantido com suporte prioritário 24h",
                      "Desconto progressivo por volume de viagens",
                      "Integração com sistema de gestão corporativo",
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 text-white/75">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-sm font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    size="lg"
                    onClick={() => setQuoteOpen(true)}
                    className="h-12 px-8 font-black rounded-full bg-primary text-black hover:bg-primary/90 shadow-[0_0_30px_rgba(245,230,66,0.2)]"
                  >
                    <Briefcase className="w-4 h-4 mr-2" />
                    Solicitar Proposta B2B
                  </Button>
                </div>

                {/* Segmentos B2B */}
                <div>
                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-5">Segmentos atendidos</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: Building2, label: "Multinacionais e grandes empresas" },
                      { icon: Briefcase, label: "Escritórios e consultorias" },
                      { icon: Plane, label: "Agências de turismo e receptivos" },
                      { icon: CalendarDays, label: "Produtoras de eventos" },
                      { icon: Users, label: "Hospitais e clínicas" },
                      { icon: MapPin, label: "Construtoras e incorporadoras" },
                      { icon: Star, label: "Redes hoteleiras" },
                      { icon: Award, label: "Universidades e colégios" },
                    ].map((seg, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/4 border border-white/8 hover:border-primary/30 transition-colors"
                      >
                        <seg.icon className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-xs font-semibold text-white/70 leading-tight">{seg.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DIFERENCIAIS */}
        <section className="py-14 px-4 bg-primary" aria-labelledby="diferenciais-heading">
          <div className="container mx-auto max-w-6xl">
            <h2 id="diferenciais-heading" className="sr-only">Por que a VaideVan é a Melhor Opção de Aluguel de Van Executiva</h2>
            <div className="grid md:grid-cols-4 gap-8 text-black text-center">
              {[
                { icon: ShieldCheck, title: t("diff.d1Title"), desc: t("diff.d1Desc") },
                { icon: Clock, title: t("diff.d2Title"), desc: t("diff.d2Desc") },
                { icon: Star, title: t("diff.d3Title"), desc: t("diff.d3Desc") },
                { icon: Award, title: t("diff.d4Title"), desc: t("diff.d4Desc") },
              ].map((item, i) => (
                <Reveal key={i} delay={i * 0.1} className="flex flex-col items-center gap-3">
                  <item.icon className="w-10 h-10" />
                  <h3 className="font-black text-xl">{item.title}</h3>
                  <p className="text-black/70 text-sm">{item.desc}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ATUAÇÃO NACIONAL */}
        <section className="py-16 px-4 bg-card">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <span className="text-primary text-sm font-bold tracking-widest uppercase mb-4 block">{t("national.label")}</span>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black mb-6">
                {t("national.title")}<br />
                <span className="text-primary">{t("national.titleHighlight")}</span>
              </h2>
              <p className="text-white/60 text-lg max-w-2xl mx-auto">
                {t("national.sub")}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                "São Paulo", "Rio de Janeiro", "Minas Gerais", "Paraná",
                "Santa Catarina", "Rio Grande do Sul", "Bahia", "Goiás",
                "Mato Grosso", "Mato Grosso do Sul", "Espírito Santo", "Ceará",
              ].map((state, i) => (
                <Reveal key={i} dir="scale" delay={i * 0.05} className="flex items-center gap-2 bg-background border border-white/10 rounded-xl px-4 py-3 hover:border-primary/40 transition-colors">
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="font-semibold text-sm">{state}</span>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* BAIRROS NOBRES SP */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-14">
              <span className="text-primary text-sm font-bold tracking-widest uppercase mb-4 block">{t("districts.label")}</span>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black mb-6">
                {t("districts.title")}{" "}
                <span className="text-primary">{t("districts.titleHighlight")}</span>
                <br />{t("districts.titleSuffix")}
              </h2>
              <p className="text-white/60 text-lg max-w-3xl mx-auto leading-relaxed">
                {t("districts.sub")}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {[
                { bairro: "Faria Lima", tipo: "Centro financeiro" },
                { bairro: "Itaim Bibi", tipo: "Hub executivo" },
                { bairro: "Berrini", tipo: "Sedes corporativas" },
                { bairro: "Vila Olímpia", tipo: "Tech & criativo" },
                { bairro: "Jardins", tipo: "Distrito de luxo" },
                { bairro: "Pinheiros", tipo: "Agências & startups" },
                { bairro: "Brooklin", tipo: "Multinacionais" },
                { bairro: "Moema", tipo: "Residencial premium" },
                { bairro: "Higienópolis", tipo: "Alto padrão" },
                { bairro: "Morumbi", tipo: "Eventos & condomínios" },
                { bairro: "Paulista", tipo: "Bancos & seguros" },
                { bairro: "Alphaville", tipo: "Complexos empresariais" },
                { bairro: "Perdizes", tipo: "Residencial nobre" },
                { bairro: "Granja Viana", tipo: "Condomínios fechados" },
                { bairro: "Santo André / ABC", tipo: "Polo industrial" },
                { bairro: "Tatuapé", tipo: "Zona Leste corporativa" },
              ].map(({ bairro, tipo }, i) => (
                <Reveal key={i} delay={i * 0.04} className="bg-card border border-white/10 rounded-2xl px-4 py-4 hover:border-primary/50 transition-colors group">
                  <MapPin className="w-4 h-4 text-primary mb-2 group-hover:scale-110 transition-transform" />
                  <p className="font-black text-sm text-white">{bairro}</p>
                  <p className="text-white/40 text-xs mt-1">{tipo}</p>
                </Reveal>
              ))}
            </div>

            {/* B2B callout */}
            <div className="bg-primary/5 border border-primary/20 rounded-3xl p-5 sm:p-8 md:p-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl md:text-3xl font-black mb-3">
                  Contrato Corporativo de Van Executiva para Empresas em SP
                </h3>
                <p className="text-white/60 leading-relaxed mb-2">
                  Locação mensal ou avulsa com <strong className="text-white">nota fiscal</strong>, SLA de pontualidade, motorista dedicado e rastreamento em tempo real. Ideal para RH, gestores de frotas e executivos assistentes nos bairros corporativos de São Paulo.
                </p>
                <ul className="text-white/50 text-sm space-y-1 mt-4 text-left inline-block">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" /> Contrato mensal com NF — sem burocracia</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" /> Gestor de conta dedicado para sua empresa</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" /> Van Mercedes Sprinter — conforto executivo premium</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" /> Rastreamento e relatórios para o RH</li>
                </ul>
              </div>
              <div className="flex-shrink-0">
                <Button
                  size="lg"
                  onClick={() => setQuoteOpen(true)}
                  className="h-14 px-8 text-base font-black rounded-full bg-primary text-black hover:bg-primary/90 shadow-[0_0_24px_rgba(245,230,66,0.25)] transition-all w-full sm:w-auto"
                >
                  Solicitar Proposta Comercial B2B
                  <ArrowRight className="w-5 h-5 ml-2 flex-shrink-0" />
                </Button>
                <p className="text-white/40 text-xs text-center mt-3 flex items-center justify-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                  </span>
                  Equipe em prontidão — resposta imediata
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* VÍDEO DE APRESENTAÇÃO */}
        <section id="apresentacao" className="py-16 px-4 bg-background">
          <div className="container mx-auto max-w-5xl">
            <Reveal className="text-center mb-12">
              <span className="text-primary text-sm font-bold tracking-widest uppercase mb-4 block">Conheça a VaideVan</span>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black mb-4">
                A Empresa por Trás da<br />
                <span className="text-primary">Maior Frota Executiva de SP</span>
              </h2>
              <p className="text-white/60 text-lg max-w-2xl mx-auto">
                Frota própria homologada, presença em todo o Brasil e a confiança de quem lidera o segmento há mais de duas décadas.
              </p>
            </Reveal>

            <Reveal className="relative w-full rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(245,230,66,0.12)] border border-white/10">
              {/* Aspect ratio 16:9 */}
              <div className="relative pb-[56.25%] h-0">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/jOLfHASgSZM?rel=0&modestbranding=1&color=white"
                  title="VaideVan — Apresentação Institucional"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            </Reveal>

            <Reveal className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {[
                { value: "20+", label: "Anos de mercado" },
                { value: "49+", label: "Cidades atendidas" },
                { value: "12", label: "Estados" },
                { value: "5.0★", label: "Google My Business" },
              ].map(({ value, label }) => (
                <div key={label} className="bg-card border border-white/10 rounded-2xl p-5">
                  <p className="text-3xl font-black text-primary mb-1">{value}</p>
                  <p className="text-white/50 text-xs font-semibold uppercase tracking-wide">{label}</p>
                </div>
              ))}
            </Reveal>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            DEPOIMENTOS — GMB Reviews carousel auto-scroll
        ══════════════════════════════════════════════════════ */}
        <section id="depoimentos" className="py-16 px-4 bg-card relative overflow-hidden" aria-labelledby="depoimentos-heading">
          {/* Glows decorativos */}
          <div className="absolute -left-40 top-1/4 w-80 h-80 rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
          <div className="absolute -right-40 bottom-1/4 w-80 h-80 rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

          <div className="container mx-auto max-w-6xl relative z-10">

            {/* Header */}
            <Reveal className="text-center mb-14">
              {/* Badge GMB aggregate */}
              <div className="inline-flex items-center gap-3 bg-background border border-white/10 rounded-2xl px-5 py-3 mb-6">
                <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className="w-4 h-4 fill-[#FBBC05] text-[#FBBC05]" />
                  ))}
                </div>
                <span className="font-black text-white text-sm">5,0</span>
                <span className="text-white/40 text-sm">· Google My Business</span>
              </div>

              <span className="text-primary text-sm font-bold tracking-widest uppercase mb-4 block">
                {t("reviews.label")}
              </span>
              <h2 id="depoimentos-heading" className="text-2xl sm:text-4xl md:text-5xl font-black mb-4">
                {t("reviews.title")}<br />
                <span className="text-primary">{t("reviews.titleHighlight")}</span>
              </h2>
              <p className="text-white/60 text-lg max-w-2xl mx-auto">
                {t("reviews.sub")}
              </p>
            </Reveal>

            {/* Carousel */}
            <div
              ref={testimonialsRef}
              className="flex gap-5 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory min-h-[320px]"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              role="list"
              aria-label="Depoimentos de clientes"
            >
              {[
                {
                  name: "Ricardo Almeida",
                  role: "Diretor Comercial · Itaim Bibi",
                  avatar: "RA",
                  color: "#4285F4",
                  stars: 5,
                  date: "Março 2026",
                  service: "Fretamento Corporativo",
                  text: "Usamos a VaideVan para transfer diário de executivos do Itaim para o Aeroporto de Congonhas. Pontualidade impecável, vans higienizadas e motoristas uniformizados. Nossa diretoria aprovou sem ressalvas. Recomendo fortemente para empresas que valorizam imagem.",
                },
                {
                  name: "Fernanda Souza",
                  role: "Gerente de RH · Faria Lima",
                  avatar: "FS",
                  color: "#34A853",
                  stars: 5,
                  date: "Fevereiro 2026",
                  service: "Transfer Aeroporto",
                  text: "Contratei a VaideVan para o transfer de toda a equipe no evento anual da empresa. Coordenação perfeita, veículos premium e o motorista foi extremamente atencioso. Economizamos 40% em relação a outras opções e tivemos muito mais conforto. 10/10!",
                },
                {
                  name: "Carlos Mendes",
                  role: "Empresário · Alphaville",
                  avatar: "CM",
                  color: "#FBBC05",
                  stars: 5,
                  date: "Janeiro 2026",
                  service: "Cota Executiva (Investidor)",
                  text: "Investi na Cota Executiva há 18 meses e o retorno superou as expectativas. A gestão é transparente, recebo relatórios mensais detalhados e o portal do investidor é excelente. A equipe da VaideVan é profissional e sempre disponível. Recomendo como investimento sólido.",
                },
                {
                  name: "Patrícia Lima",
                  role: "Coordenadora de Eventos · Vila Olímpia",
                  avatar: "PL",
                  color: "#EA4335",
                  stars: 5,
                  date: "Dezembro 2025",
                  service: "Van para Eventos",
                  text: "Utilizei a VaideVan para o traslado de 120 convidados em uma festa de casamento. Foram 6 vans que funcionaram como um relógio. Todos os motoristas usavam colete e eram muito educados. Os noivos ficaram encantados. Já tenho outros 3 eventos agendados com eles!",
                },
                {
                  name: "Eduardo Tanaka",
                  role: "CFO · Brooklin Novo",
                  avatar: "ET",
                  color: "#9C27B0",
                  stars: 5,
                  date: "Novembro 2025",
                  service: "Fretamento Corporativo",
                  text: "Nosso contrato de fretamento anual com a VaideVan é um dos melhores investimentos que fizemos. A frota é nova, os motoristas são treinados e o suporte 24h resolve tudo imediatamente. Em 2 anos de contrato nunca tivemos um atraso sequer. Parceria impecável.",
                },
                {
                  name: "Juliana Ferreira",
                  role: "Médica · Morumbi",
                  avatar: "JF",
                  color: "#FF5722",
                  stars: 5,
                  date: "Outubro 2025",
                  service: "Transporte Executivo",
                  text: "Como profissional de saúde, minha agenda é intensa. A VaideVan se tornou meu serviço de transporte fixo — pontual, confortável e seguro. As vans são limpíssimas e os motoristas sabem exatamente o melhor caminho para evitar trânsito. Simplesmente indispensável.",
                },
                {
                  name: "Marcos Cavalcanti",
                  role: "Sócio-Diretor · Pinheiros",
                  avatar: "MC",
                  color: "#00BCD4",
                  stars: 5,
                  date: "Setembro 2025",
                  service: "Excursão Corporativa",
                  text: "Contratamos para uma excursão de 2 dias com 45 colaboradores até Campos do Jordão. Van executiva impecável, motorista conhecia cada detalhe da rota e o conforto foi o de um ônibus de luxo. O grupo ficou encantado e já pedimos nova excursão para dezembro.",
                },
                {
                  name: "Ana Paula Ribeiro",
                  role: "Administradora · Jardins",
                  avatar: "AP",
                  color: "#8BC34A",
                  stars: 5,
                  date: "Agosto 2025",
                  service: "Transfer Aeroporto GRU",
                  text: "Já usei dezenas de serviços de transfer em São Paulo. A VaideVan é outro nível. Van Mercedes Sprinter impecável, motorista chegou 20 minutos antes, água gelada e carregador disponíveis. No aeroporto, zero estresse. Preço justo por tudo que oferecem. Nota 10.",
                },
                {
                  name: "Roberto Nunes",
                  role: "Gerente de Operações · Santo André",
                  avatar: "RN",
                  color: "#FF9800",
                  stars: 5,
                  date: "Julho 2025",
                  service: "Fretamento Diário",
                  text: "Temos 30 funcionários que usam o fretamento da VaideVan diariamente. Em 1 ano de contrato, a satisfação da equipe aumentou muito. Os ônibus corporativos eram um pesadelo — com a VaideVan, todo mundo chega descansado e no horário. Renovamos por mais 2 anos.",
                },
                {
                  name: "Luciana Castro",
                  role: "Investidora · Higienópolis",
                  avatar: "LC",
                  color: "#E91E63",
                  stars: 5,
                  date: "Junho 2025",
                  service: "Cota Master (Investidora)",
                  text: "Invisto na VaideVan há 3 anos e é a melhor decisão financeira que tomei além do imóvel. Retorno mensal consistente, empresa totalmente organizada e transparente. Tenho acesso ao portal do investidor com todos os dados em tempo real. Já indiquei para outros 5 amigos.",
                },
              ].map((r, i) => (
                <article
                  key={i}
                  role="listitem"
                  className="flex-shrink-0 w-[320px] md:w-[360px] snap-start bg-background rounded-3xl border border-white/10 p-6 flex flex-col gap-4 hover:border-primary/30 transition-all duration-300 group"
                  itemScope
                  itemType="https://schema.org/Review"
                >
                  {/* Header do card */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                        style={{ background: r.color + "33", border: `2px solid ${r.color}55` }}
                        aria-hidden="true"
                      >
                        <span style={{ color: r.color }}>{r.avatar}</span>
                      </div>
                      <div>
                        <p className="font-black text-white text-sm leading-tight" itemProp="author" itemScope itemType="https://schema.org/Person">
                          <span itemProp="name">{r.name}</span>
                        </p>
                        <p className="text-white/40 text-xs leading-tight">{r.role}</p>
                      </div>
                    </div>
                    {/* Google G */}
                    <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0 opacity-60" aria-label="Google Review">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  </div>

                  {/* Estrelas + serviço */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex gap-0.5" itemProp="reviewRating" itemScope itemType="https://schema.org/Rating">
                      <meta itemProp="ratingValue" content={String(r.stars)} />
                      <meta itemProp="bestRating" content="5" />
                      {Array.from({ length: r.stars }).map((_, s) => (
                        <Star key={s} className="w-4 h-4 fill-[#FBBC05] text-[#FBBC05]" />
                      ))}
                    </div>
                    <span className="text-[10px] font-black px-2.5 py-1 rounded-full" style={{ background: "#F5E64218", color: "#F5E642", border: "1px solid #F5E64233" }}>
                      {r.service}
                    </span>
                  </div>

                  {/* Texto */}
                  <blockquote className="text-white/70 text-sm leading-relaxed flex-1 line-clamp-5 group-hover:line-clamp-none transition-all" itemProp="reviewBody">
                    "{r.text}"
                  </blockquote>

                  {/* Data */}
                  <p className="text-white/30 text-xs font-semibold" itemProp="datePublished">{r.date}</p>
                </article>
              ))}
            </div>

            {/* Indicadores + CTA */}
            <Reveal className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {["RA","FS","CM","PL","ET"].map((initials, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-card bg-white/10 flex items-center justify-center text-[10px] font-black text-white/60" aria-hidden="true">
                      {initials}
                    </div>
                  ))}
                </div>
                <p className="text-white/50 text-sm">
                  <span className="font-black text-white">+500 avaliações</span> verificadas no Google
                </p>
              </div>
              <a
                href="https://g.co/kgs/vaidevan"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10 hover:border-white/20 transition-all group"
                aria-label="Ver todas as avaliações no Google"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Ver todas no Google
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </a>
            </Reveal>

          </div>
        </section>

        {/* FAQ — lazy loaded, move vendor-radix fora do caminho crítico */}
        <Suspense fallback={<div className="py-16 px-4 bg-card min-h-[300px]" />}>
          <HomeFAQSection />
        </Suspense>

        {/* CTA FINAL */}
        <section className="py-16 px-4 relative overflow-hidden cv-auto">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(245,230,66,0.08),transparent)]" />
          <div className="container mx-auto max-w-4xl text-center relative z-10">
            <Reveal>
              <h2 className="text-3xl sm:text-5xl md:text-7xl font-black mb-6 leading-tight">
                {t("cta.title")}<br />
                <span className="text-primary">{t("cta.titleHighlight")}</span>
              </h2>
              <p className="text-white/60 text-xl mb-10 max-w-2xl mx-auto">
                {t("cta.sub")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                  <Button
                    size="lg"
                    data-testid="final-cta-button"
                    className="h-14 px-12 text-lg font-black rounded-full bg-primary text-black hover:bg-primary/90 shadow-[0_0_40px_rgba(245,230,66,0.3)] transition-all"
                  >
                    {t("cta.whatsapp")}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </a>
                <a href="#seja-investidor">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-10 text-lg font-black rounded-full border-white/20 hover:border-primary hover:text-primary transition-all"
                  >
                    {t("hero.cta_invest")}
                  </Button>
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        {/* FORMULÁRIO DE CONTATO */}
        <section id="contato" className="py-16 px-4 bg-card/50 cv-auto">
          <div className="container mx-auto max-w-6xl">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div>
                <span className="text-primary text-xs font-black tracking-widest uppercase mb-4 block">{t("contact.label")}</span>
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black leading-tight mb-6">
                  {t("contact.title")}<br />
                  <span className="text-primary">{t("contact.titleHighlight")}</span>
                </h2>
                <p className="text-white/60 text-lg mb-8 leading-relaxed">
                  {t("contact.sub")}
                </p>
                <div className="space-y-4">
                  {[
                    { label: t("contact.g1Label"), desc: t("contact.g1Desc") },
                    { label: t("contact.g2Label"), desc: t("contact.g2Desc") },
                    { label: t("contact.g3Label"), desc: t("contact.g3Desc") },
                  ].map(({ label, desc }) => (
                    <div key={label} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <div>
                        <span className="font-black text-sm">{label}</span>
                        <span className="text-white/40 text-sm ml-2">{desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl bg-card border border-white/10 p-8">
                <Suspense fallback={<div className="h-48 animate-pulse bg-white/5 rounded-xl" />}>
                  <ContactForm />
                </Suspense>
              </div>
            </div>
          </div>
        </section>

        {/* LOCALIZAÇÃO — Google Maps lazy-loaded */}
        <MapSection />
      </main>

      {/* FOOTER */}
      <footer className="bg-card border-t border-white/10 py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-10 mb-12">

            {/* Logo + Desc + Redes */}
            <div>
              <img src="/logo-black-sm.webp" alt="VaideVan — Locação de Vans Executivas Premium" className="h-14 mb-5 object-contain" width="56" height="56" loading="lazy" />
              <p className="text-white/50 text-sm leading-relaxed mb-6">
                {t("footer.desc")}
              </p>
              {/* Ícones Redes Sociais */}
              <p className="font-black mb-3 text-xs uppercase tracking-widest text-white/40">{t("footer.follow")}</p>
              <div className="flex flex-wrap gap-3">
                {[
                  { href: "https://www.instagram.com/vaidevanoficial/", label: "Instagram", path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" },
                  { href: "https://www.facebook.com/vaidevanoficial/", label: "Facebook", path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
                  { href: "https://www.tiktok.com/@vaidevan1", label: "TikTok", path: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" },
                  { href: "https://br.pinterest.com/vaidevan/", label: "Pinterest", path: "M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.669.967-2.917 2.171-2.917 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" },
                  { href: "https://x.com/vaidevansempre", label: "X", path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
                  { href: "https://www.linkedin.com/company/vaidevan", label: "LinkedIn", path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" },
                  { href: "https://www.youtube.com/@vaidevanlocadoradeveiculos6655", label: "YouTube", path: "M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z" },
                ].map(({ href, label, path }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary/20 hover:border-primary/40 transition-all group"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white/50 group-hover:fill-primary transition-colors" aria-hidden="true">
                      <path d={path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Serviços */}
            <div>
              <p className="font-black mb-4 text-sm uppercase tracking-wide">{t("footer.services")}</p>
              <ul className="space-y-2 text-white/50 text-sm">
                <li><Link href="/transfer-aeroporto" className="hover:text-primary transition-colors">{t("footer.s1")}</Link></li>
                <li><Link href="/fretamento-corporativo" className="hover:text-primary transition-colors">{t("footer.s2")}</Link></li>
                <li><Link href="/van-para-eventos" className="hover:text-primary transition-colors">{t("footer.s3")}</Link></li>
                <li><Link href="/transporte-executivo" className="hover:text-primary transition-colors">{t("footer.s4")}</Link></li>
                <li><Link href="/excursoes" className="hover:text-primary transition-colors">{t("footer.s5")}</Link></li>
                <li><Link href="/compra-venda" className="hover:text-primary transition-colors">{t("footer.s6")}</Link></li>
                <li><Link href="/customizacao" className="hover:text-primary transition-colors">{t("footer.s7")}</Link></li>
                <li><Link href="/frota" className="hover:text-primary transition-colors">{t("nav.fleet")}</Link></li>
                <li><Link href="/escolta" className="hover:text-primary transition-colors">Cadastro de Agentes de Escolta</Link></li>
                <li><Link href="/termos" className="hover:text-primary transition-colors">{t("footer.s8")}</Link></li>
                <li><Link href="/privacidade" className="hover:text-primary transition-colors">{t("footer.s9")}</Link></li>
              </ul>
            </div>

            {/* Contato */}
            <div>
              <p className="font-black mb-4 text-sm uppercase tracking-wide">{t("footer.contact")}</p>
              <ul className="space-y-2 text-white/50 text-sm">
                <li>
                  <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-2">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#25d366] flex-shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                    +55 11 99929-4694
                  </a>
                </li>
                <li><a href="mailto:contato@vaidevan.com" className="hover:text-primary transition-colors">contato@vaidevan.com</a></li>
                <li><a href="https://vaidevan.com" className="hover:text-primary transition-colors">vaidevan.com</a></li>
                <li>{t("footer.city")}</li>
                <li className="pt-2">
                  <Link href="/portal" className="text-primary font-bold hover:underline">
                    {t("nav.portal")}
                  </Link>
                </li>
              </ul>
            </div>

            {/* QR Code WhatsApp */}
            <div>
              <p className="font-black mb-4 text-sm uppercase tracking-wide">WhatsApp Direto</p>
              <div className="flex flex-col items-start gap-3">
                <div className="rounded-2xl overflow-hidden bg-white p-2 w-[120px] h-[120px] flex-shrink-0">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=https%3A%2F%2Fwa.me%2F5511999294694&format=svg&color=0A0A0A&bgcolor=ffffff"
                    alt="QR Code WhatsApp VaideVan"
                    width="110"
                    height="110"
                    loading="lazy"
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-white/40 text-xs leading-snug">
                  Aponte a câmera<br />para chamar no WhatsApp
                </p>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-black text-[#25d366] hover:underline flex items-center gap-1"
                >
                  Ou clique aqui →
                </a>
              </div>
            </div>

          </div>
          {/* Selos de Certificação */}
          <div className="border-t border-white/10 py-7 flex flex-wrap items-center justify-center gap-4">
            {/* TripAdvisor */}
            <a
              href="https://www.tripadvisor.com.br/"
              target="_blank"
              rel="noopener noreferrer"
              title="VaideVan no TripAdvisor"
              className="group flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 hover:bg-[#00aa6c]/10 hover:border-[#00aa6c]/40 transition-all"
            >
              <div className="relative w-12 h-12 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle cx="50" cy="50" r="50" fill="#00aa6c"/>
                  <circle cx="32" cy="50" r="17" fill="white"/>
                  <circle cx="68" cy="50" r="17" fill="white"/>
                  <circle cx="32" cy="50" r="10" fill="#00aa6c"/>
                  <circle cx="68" cy="50" r="10" fill="#00aa6c"/>
                  <circle cx="32" cy="50" r="5" fill="white"/>
                  <circle cx="68" cy="50" r="5" fill="white"/>
                  <circle cx="33" cy="49" r="2.5" fill="#c00"/>
                  <circle cx="69" cy="49" r="2.5" fill="#c00"/>
                  <path d="M20 35 Q32 22 44 35" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
                  <path d="M56 35 Q68 22 80 35" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
                  <path d="M40 67 Q50 76 60 67" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <p className="text-white font-black text-sm leading-tight">TripAdvisor</p>
                <div className="flex gap-px my-0.5">
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} viewBox="0 0 24 24" className="w-3 h-3 fill-[#00aa6c]"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  ))}
                </div>
                <p className="text-white/40 text-[10px] leading-tight">Certificado de Excelência</p>
              </div>
            </a>

            {/* Cadastur */}
            <div
              title="VaideVan registrada no Cadastur — Ministério do Turismo"
              className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-5 py-3"
            >
              <div className="relative w-12 h-12 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <defs>
                    <linearGradient id="cadasturGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#009c3b"/>
                      <stop offset="50%" stopColor="#002776"/>
                      <stop offset="100%" stopColor="#009c3b"/>
                    </linearGradient>
                  </defs>
                  <path d="M50 4 L92 28 L92 72 L50 96 L8 72 L8 28 Z" fill="url(#cadasturGrad)" stroke="#ffdf00" strokeWidth="2.5"/>
                  <circle cx="50" cy="50" r="26" fill="#002776"/>
                  <circle cx="50" cy="50" r="22" fill="none" stroke="#ffdf00" strokeWidth="1.5"/>
                  <path d="M50 30 Q62 36 66 50 Q62 64 50 70 Q38 64 34 50 Q38 36 50 30Z" fill="#009c3b"/>
                  <text x="50" y="54" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="Arial">✓</text>
                  <text x="50" y="84" textAnchor="middle" fill="#ffdf00" fontSize="7" fontWeight="bold" fontFamily="Arial">CADASTUR</text>
                </svg>
              </div>
              <div>
                <p className="text-white font-black text-sm leading-tight">Cadastur</p>
                <p className="text-white/60 text-[10px] leading-tight mt-0.5">Ministério do Turismo</p>
                <p className="text-white/35 text-[10px] leading-tight">Operador Credenciado</p>
              </div>
            </div>
          </div>

          {/* Atende Rent a Car — Identidade Corporativa */}
          <div className="border-t border-white/10 py-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-2xl px-5 py-3 hover:border-primary/30 transition-colors">
              <span className="text-xl">🏢</span>
              <div>
                <p className="text-white/70 text-xs font-bold leading-tight">Braço de Luxo da <span className="text-primary">Atende Rent a Car</span></p>
                <p className="text-white/35 text-[10px] font-mono leading-tight mt-0.5">CNPJ: 63.931.058/0001-79 · Curitiba, PR · Brasil · EUA · Europa</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-2xl px-5 py-3">
              <span className="text-xl">⚖️</span>
              <div>
                <p className="text-white/70 text-xs font-bold leading-tight">Segurança Jurídica</p>
                <p className="text-white/35 text-[10px] leading-tight mt-0.5">Amparado pela Lei 10.406/02 (Locação)</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-2xl px-5 py-3">
              <span className="text-xl">🚐</span>
              <div>
                <p className="text-white/70 text-xs font-bold leading-tight">Frota Exclusiva</p>
                <p className="text-white/35 text-[10px] leading-tight mt-0.5">Mercedes-Benz Sprinter · Nova Série · Baixo KM</p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-white/30 text-xs">
            <p>&copy; {new Date().getFullYear()} VaideVan — Atende Rent a Car. {t("footer.copyright")}</p>
            <p className="font-mono">CNPJ: 63.931.058/0001-79 · Marca Registrada · 12 Estados · 49+ Cidades</p>
          </div>
        </div>
      </footer>

      <WhatsAppButton />
      <Suspense fallback={null}>
        <QuoteModal open={quoteOpen} onOpenChange={setQuoteOpen} />
      </Suspense>
      {partnerOpen && <PartnerModal onClose={() => setPartnerOpen(false)} />}
    </div>
  );
}
