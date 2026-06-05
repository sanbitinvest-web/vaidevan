import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("vv-in"); obs.disconnect(); } },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return <div ref={ref} className={`vv-reveal-up ${className}`}>{children}</div>;
}

const FAQS = [
  {
    q: "A VaideVan oferece contrato mensal de van executiva para empresas em SP?",
    a: "Sim. A VaideVan oferece contrato mensal de fretamento corporativo com emissão de nota fiscal, SLA de pontualidade e motorista dedicado. Atendemos empresas nos principais bairros corporativos de São Paulo: Faria Lima, Itaim Bibi, Berrini, Vila Olímpia, Brooklin, Paulista e Alphaville. Entre em contato pelo WhatsApp para receber uma proposta comercial personalizada.",
  },
  {
    q: "A VaideVan faz transfer executivo no Itaim Bibi, Jardins, Faria Lima e demais bairros nobres de SP?",
    a: "Sim. Atendemos todos os bairros nobres e corporativos de São Paulo 24 horas por dia, 7 dias por semana: Faria Lima, Itaim Bibi, Berrini, Jardins, Higienópolis, Moema, Morumbi, Pinheiros, Vila Olímpia, Brooklin, Perdizes, Alphaville e mais. Motoristas bilíngues disponíveis sob demanda.",
  },
  {
    q: "Como funciona o transfer de van executiva para aeroporto GRU, CGH e VCP?",
    a: "A VaideVan faz busca no seu endereço em São Paulo — hotel, escritório ou residência nos bairros nobres — e leva diretamente aos aeroportos Guarulhos (GRU), Congonhas (CGH) e Viracopos (VCP). Monitoramos o voo em tempo real para ajustar horários. Orçamento imediato pelo WhatsApp.",
  },
  {
    q: "Em quais estados a VaideVan oferece aluguel de van executiva?",
    a: "A VaideVan oferece locação de vans executivas em 12 estados brasileiros: São Paulo, Rio de Janeiro, Minas Gerais, Paraná, Santa Catarina, Rio Grande do Sul, Bahia, Goiás, Mato Grosso, Mato Grosso do Sul, Espírito Santo e Ceará — em mais de 49 cidades.",
  },
  {
    q: "Quais serviços de locação de van executiva a VaideVan oferece?",
    a: "Oferecemos: aluguel de van para aeroporto (GRU, CGH e VCP), fretamento corporativo B2B com contrato mensal, locação de van para eventos corporativos e sociais, van para excursões em grupo e locação de van para viagens interestaduais — sempre com Mercedes-Benz Sprinter Executive.",
  },
  {
    q: "Como solicitar orçamento para aluguel de van com motorista em SP?",
    a: "Solicite seu orçamento de locação de van executiva pelo WhatsApp: +55 11 99929-4694. Atendimento 24 horas por dia, 7 dias por semana. Nossa equipe está de prontidão — resposta imediata.",
  },
  {
    q: "A VaideVan possui qual modelo de van para locação?",
    a: "A VaideVan opera com frota exclusiva de Mercedes-Benz Sprinter Executive — a van de transporte executivo premium do mercado, com ar-condicionado, conforto para até 15 passageiros e rastreamento GPS em tempo real. Marca registrada no INPI, referência nacional em transporte de alto padrão.",
  },
];

export default function HomeFAQSection() {
  const { t } = useTranslation();
  return (
    <section id="faq" className="py-24 px-4 bg-card cv-auto">
      <div className="container mx-auto max-w-3xl">
        <Reveal className="text-center mb-16">
          <span className="text-primary text-sm font-bold tracking-widest uppercase mb-4 block">{t("faq.label")}</span>
          <h2 className="text-4xl md:text-5xl font-black mb-4">
            {t("faq.title")}<br />
            <span className="text-primary">{t("faq.titleHighlight")}</span>
          </h2>
          <p className="text-white/60">{t("faq.sub")}</p>
        </Reveal>

        <Accordion type="single" collapsible className="w-full space-y-3">
          {FAQS.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="bg-card border border-white/10 rounded-2xl px-6 data-[state=open]:border-primary/30 transition-colors"
            >
              <AccordionTrigger className="text-left font-bold text-base py-5 hover:no-underline hover:text-primary">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-white/60 text-base pb-5 leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
