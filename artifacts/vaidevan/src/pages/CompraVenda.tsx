import { useState } from "react";
import { ServiceLayout } from "@/components/ServiceLayout";
import {
  TrendingUp, ShieldCheck, FileText, Truck, DollarSign,
  CheckCircle2, ArrowRight, Star, Wrench, BarChart3, Phone,
} from "lucide-react";

import { useTranslation } from "react-i18next";
import { waLink } from "@/lib/waLink";

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Compra e Venda de Vans Executivas",
    "provider": {
      "@type": "LocalBusiness",
      "name": "VaideVan",
      "url": "https://vaidevan.com",
      "telephone": "+5511999294694",
      "address": { "@type": "PostalAddress", "addressLocality": "São Paulo", "addressRegion": "SP", "addressCountry": "BR" },
    },
    "description": "Compra e venda de vans executivas Mercedes-Benz Sprinter seminovas e novas. Avaliação gratuita, financiamento facilitado, documentação completa e garantia.",
    "areaServed": "BR",
    "serviceType": "Compra e Venda de Veículos Executivos",
    "url": "https://vaidevan.com/compra-venda",
    "offers": [
      { "@type": "Offer", "name": "Sprinter 415 2022/2023", "priceCurrency": "BRL", "price": "285000", "availability": "https://schema.org/InStock", "itemCondition": "https://schema.org/UsedCondition" },
      { "@type": "Offer", "name": "Sprinter 416 2021/2022", "priceCurrency": "BRL", "price": "265000", "availability": "https://schema.org/InStock", "itemCondition": "https://schema.org/UsedCondition" },
    ],
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "127", "bestRating": "5" },
    "faqPage": {
      "@type": "FAQPage",
      "mainEntity": [
        { "@type": "Question", "name": "Como funciona a avaliação gratuita da minha van?", "acceptedAnswer": { "@type": "Answer", "text": "Envie fotos, documentos e quilometragem pelo WhatsApp. Nosso perito avalia o veículo presencialmente ou remotamente e emite laudo técnico completo. A avaliação é 100% gratuita e o orçamento é gratuito." } },
        { "@type": "Question", "name": "Qual o prazo para receber o pagamento após vender minha van?", "acceptedAnswer": { "@type": "Answer", "text": "Após a assinatura do contrato e transferência da documentação, o pagamento é realizado em até 2 dias úteis. Trabalhamos com transferência bancária ou PIX." } },
        { "@type": "Question", "name": "Vocês oferecem financiamento para compra de van?", "acceptedAnswer": { "@type": "Answer", "text": "Sim. Temos parceria com bancos e financeiras para parcelamento em até 60x com as melhores taxas do mercado. Consulte condições pelo WhatsApp." } },
      ],
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Início", "item": "https://vaidevan.com/" },
      { "@type": "ListItem", "position": 2, "name": "Compra e Venda de Vans Executivas", "item": "https://vaidevan.com/compra-venda" },
    ],
  },
];

const ADVANTAGES = [
  { icon: ShieldCheck, title: "Avaliação gratuita", desc: "Avaliamos sua van com orçamento gratuito, laudo técnico completo e precificação de mercado." },
  { icon: DollarSign, title: "Melhor preço garantido", desc: "Negociamos direto com compradores da nossa rede, eliminando intermediários e maximizando seu valor." },
  { icon: FileText, title: "Documentação completa", desc: "Toda a papelada — DETRAN, transferência, IPVA e laudo cautelar — cuidamos por você." },
  { icon: Truck, title: "Estoque homologado", desc: "Compramos vans com documentação ok, revisão mecânica e histórico comprovado." },
  { icon: TrendingUp, title: "Financiamento facilitado", desc: "Parcerias com bancos e financeiras para compra parcelada com as melhores taxas do mercado." },
  { icon: BarChart3, title: "Transparência total", desc: "Relatório de precificação e histórico FIPE para cada veículo negociado." },
];

const FLEET_ITEMS = [
  { model: "Mercedes-Benz Sprinter 415", year: "2022/2023", seats: "15 lugares", km: "38.000 km", price: "R$ 285.000", badge: "Disponível" },
  { model: "Mercedes-Benz Sprinter 416", year: "2021/2022", seats: "16 lugares", km: "52.000 km", price: "R$ 265.000", badge: "Disponível" },
  { model: "Mercedes-Benz Sprinter 316", year: "2023/2024", seats: "19 lugares", km: "18.000 km", price: "R$ 320.000", badge: "Reservado" },
  { model: "Mercedes-Benz Sprinter 515", year: "2020/2021", seats: "15 lugares", km: "78.000 km", price: "R$ 225.000", badge: "Disponível" },
];

const STEPS = [
  { n: "01", title: "Nos contate", desc: "Envie fotos, documentos e quilometragem pelo WhatsApp. Orçamento gratuito." },
  { n: "02", title: "Avaliação técnica", desc: "Nosso perito avalia o veículo presencialmente ou remotamente e emite laudos." },
  { n: "03", title: "Proposta", desc: "Receba uma proposta formal em até 24h com os melhores valores do mercado." },
  { n: "04", title: "Fechamento", desc: "Assinamos o contrato, transferimos a documentação e realizamos o pagamento." },
];

export default function CompraVenda() {
  const { i18n } = useTranslation();
  const [tab, setTab] = useState<"comprar" | "vender">("comprar");
  const waCompra = waLink("buy_sell", i18n.language);

  return (
    <ServiceLayout
      title="Compra e Venda de Vans Executivas | VaideVan São Paulo"
      description="Compre ou venda sua van executiva Mercedes-Benz Sprinter com segurança e transparência. Avaliação gratuita, documentação completa, financiamento facilitado. 20+ anos de mercado em São Paulo."
      canonical="https://vaidevan.com/compra-venda"
      keywords="compra venda van executiva SP, comprar van Mercedes Sprinter SP, vender van executiva usada, van seminova executiva São Paulo, compra van empresarial, venda frota van executiva, van executiva seminova São Paulo, mercedes sprinter seminova SP, comprar sprinter executivo, vender van corporativa"
      whatsappContext="buy_sell"
      structuredData={structuredData}
      breadcrumbName="Compra e Venda de Vans Executivas"
    >
      {/* HERO */}
      <section className="relative py-24 px-4 overflow-hidden" style={{ background: "linear-gradient(135deg,#0a0a0a 0%,#111 60%,#1a1500 100%)" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(245,230,66,.4) 1px,transparent 1px),linear-gradient(90deg,rgba(245,230,66,.4) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="relative container mx-auto max-w-5xl text-center">
          <span className="text-primary text-xs font-black tracking-widest uppercase mb-4 block">Frota Executiva Premium</span>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black leading-tight mb-6">
            Compra e Venda de<br />
            <span className="text-primary">Vans Executivas em SP</span>
          </h1>
          <p className="text-white/70 text-base md:text-xl max-w-2xl mx-auto mb-10">
            Negociamos Mercedes-Benz Sprinter com laudo técnico, documentação 100% regularizada e as melhores condições do mercado. 20+ anos de expertise em frotas executivas.
          </p>

          {/* Tab selector */}
          <div className="inline-flex bg-white/5 border border-white/10 rounded-2xl p-1.5 mb-8">
            <button
              onClick={() => setTab("comprar")}
              className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${tab === "comprar" ? "bg-primary text-black" : "text-white/60 hover:text-white"}`}
            >
              Quero Comprar
            </button>
            <button
              onClick={() => setTab("vender")}
              className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${tab === "vender" ? "bg-primary text-black" : "text-white/60 hover:text-white"}`}
            >
              Quero Vender
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <a href={waCompra} target="_blank" rel="noopener noreferrer">
              <button className="bg-primary text-black font-black rounded-full px-8 py-4 text-lg hover:bg-primary/90 transition-all">
                {tab === "comprar" ? "Ver Vans Disponíveis" : "Avaliar Minha Van"} <ArrowRight className="inline w-5 h-5 ml-1" />
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-primary py-10 px-4">
        <div className="container mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-black">
          {[
            { v: "20+", l: "Anos no mercado" },
            { v: "500+", l: "Vans negociadas" },
            { v: "100%", l: "Documentação ok" },
            { v: "48h", l: "Prazo para proposta" },
          ].map(({ v, l }) => (
            <div key={l}>
              <div className="text-3xl md:text-4xl font-black">{v}</div>
              <div className="text-xs font-bold uppercase tracking-wider opacity-70 mt-1">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* VANTAGENS */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <span className="text-primary text-xs font-black tracking-widest uppercase mb-3 block text-center">Por que a VaideVan</span>
          <h2 className="text-3xl md:text-4xl font-black text-center mb-4">
            A forma mais segura de negociar sua van
          </h2>
          <p className="text-white/60 text-center max-w-2xl mx-auto mb-14">
            Mais de 20 anos conectando compradores e vendedores de vans executivas com transparência e segurança jurídica.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ADVANTAGES.map(({ icon: Icon, title, desc }) => (
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

      {/* ESTOQUE */}
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto max-w-6xl">
          <span className="text-primary text-xs font-black tracking-widest uppercase mb-3 block text-center">Estoque atual</span>
          <h2 className="text-3xl md:text-4xl font-black text-center mb-4">Vans disponíveis para compra</h2>
          <p className="text-white/60 text-center max-w-2xl mx-auto mb-14">
            Todas com documentação regularizada, revisão mecânica e garantia. Financiamento em até 60x.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {FLEET_ITEMS.map(item => (
              <div key={item.model} className="group p-6 rounded-2xl bg-background border border-white/10 hover:border-primary/40 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-black text-white text-lg">{item.model}</h3>
                    <p className="text-white/50 text-sm">{item.year} • {item.seats}</p>
                  </div>
                  <span className={`text-xs font-black rounded-full px-3 py-1 ${item.badge === "Disponível" ? "bg-green-400/10 text-green-400 border border-green-400/20" : "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20"}`}>
                    {item.badge}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-white/40 text-sm flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" />{item.km}
                  </span>
                  <span className="text-primary font-black text-xl">{item.price}</span>
                </div>
                <a href={waCompra} target="_blank" rel="noopener noreferrer">
                  <button className="w-full py-2.5 rounded-xl border border-white/10 text-white/70 hover:border-primary hover:text-primary font-bold text-sm transition-all">
                    Consultar disponibilidade <ArrowRight className="inline w-4 h-4 ml-1" />
                  </button>
                </a>
              </div>
            ))}
          </div>
          <p className="text-center text-white/40 text-sm mt-8">Estoque atualizado semanalmente. Consulte disponibilidade pelo WhatsApp.</p>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <span className="text-primary text-xs font-black tracking-widest uppercase mb-3 block text-center">Processo</span>
          <h2 className="text-3xl md:text-4xl font-black text-center mb-14">Como funciona a venda da sua van?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map(({ n, title, desc }) => (
              <div key={n} className="relative p-6 rounded-2xl bg-card border border-white/10">
                <div className="text-4xl font-black text-primary/20 mb-4">{n}</div>
                <h3 className="font-black text-white mb-2">{title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto max-w-5xl">
          <span className="text-primary text-xs font-black tracking-widest uppercase mb-3 block text-center">Depoimentos</span>
          <h2 className="text-3xl font-black text-center mb-12">Quem já negociou com a VaideVan</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Carlos Mendes", role: "Empresário, SP", text: "Vendi minha Sprinter em menos de uma semana. Tudo documentado, sem dor de cabeça. Preço justo e processo transparente." },
              { name: "Logística Premium Ltda", role: "Gestora de frota", text: "Compramos 3 vans do estoque da VaideVan. Todas em perfeito estado, financiamento aprovado em 48h. Parceria de longo prazo." },
              { name: "Ana Beatriz", role: "Diretora comercial", text: "Processo impecável. Eles cuidaram de toda a documentação. Recebemos o pagamento em 2 dias após a assinatura." },
            ].map(({ name, role, text }) => (
              <div key={name} className="p-6 rounded-2xl bg-background border border-white/10">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-4 h-4 text-primary fill-primary" />)}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-4">"{text}"</p>
                <div>
                  <div className="font-black text-white text-sm">{name}</div>
                  <div className="text-white/40 text-xs">{role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA VENDA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="rounded-3xl border border-primary/30 bg-primary/5 p-10 text-center">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Quer vender sua van agora?</h2>
            <p className="text-white/60 mb-8 max-w-xl mx-auto">Envie fotos e dados do veículo. Nosso perito avalia em até 24h e você recebe uma proposta formal e gratuita.</p>
            <a href={waCompra} target="_blank" rel="noopener noreferrer">
              <button className="bg-primary text-black font-black rounded-full px-8 py-4 text-lg hover:bg-primary/90 transition-all inline-flex items-center gap-2">
                <Phone className="w-5 h-5" /> Avaliar minha van grátis
              </button>
            </a>
            <p className="text-white/30 text-xs mt-4">Orçamento gratuito · Resposta em até 24h · Pagamento na assinatura</p>
          </div>
        </div>
      </section>
    </ServiceLayout>
  );
}
