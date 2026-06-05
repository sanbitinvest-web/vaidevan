import { ServiceLayout } from "@/components/ServiceLayout";
import { CheckCircle2, Building2, TrendingUp, Clock, ShieldCheck, FileText, Scale } from "lucide-react";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Fretamento Corporativo de Van",
  "provider": { "@type": "LocalBusiness", "name": "VaideVan", "url": "https://vaidevan.com" },
  "description": "Fretamento de van executiva para empresas em São Paulo e todo o Brasil. Van Mercedes-Benz Sprinter com motorista profissional para transporte diário de funcionários.",
  "areaServed": "BR",
  "serviceType": "Fretamento de Van Corporativo",
  "url": "https://vaidevan.com/fretamento-corporativo",
  "offers": { "@type": "Offer", "availability": "https://schema.org/InStock", "priceCurrency": "BRL" },
  "faqPage": {
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "Qual o valor do fretamento corporativo de van?", "acceptedAnswer": { "@type": "Answer", "text": "O valor varia conforme a rota, frequência e número de colaboradores. Em geral, o custo por pessoa é inferior ao vale-transporte individual. Solicite uma cotação gratuita pelo WhatsApp +55 11 99929-4694." } },
      { "@type": "Question", "name": "A VaideVan emite nota fiscal?", "acceptedAnswer": { "@type": "Answer", "text": "Sim. A VaideVan emite nota fiscal eletrônica (NF-e) para todos os contratos corporativos. Os contratos são formalizados com CNPJ e incluem SLA de pontualidade." } },
      { "@type": "Question", "name": "Em quanto tempo começa o serviço após a contratação?", "acceptedAnswer": { "@type": "Answer", "text": "Em até 48 horas após a assinatura do contrato, o serviço de fretamento já está operando." } }
    ]
  }
};

export default function FretamentoCorporativo() {
  return (
    <ServiceLayout
      title="Fretamento Corporativo de Van para Empresas | VaideVan São Paulo"
      description="Fretamento de van executiva para transporte de funcionários em São Paulo e Brasil. Mercedes-Benz Sprinter com motorista profissional. Contratos mensais com nota fiscal. Solicite cotação."
      canonical="https://vaidevan.com/fretamento-corporativo"
      keywords="fretamento corporativo van SP, contrato mensal van executiva empresa, fretamento corporativo Faria Lima, van empresas Itaim Bibi, locação van Berrini SP, fretamento executivo Vila Olímpia, van corporativa Brooklin, fretamento van Alphaville, van com motorista Paulista SP, transporte funcionários nota fiscal, van Mercedes Sprinter empresa contrato, gestor dedicado transporte executivo B2B"
      whatsappContext="corporate"
      structuredData={structuredData}
      breadcrumbName="Fretamento Corporativo de Van"
    >
      {/* HERO */}
      <section className="relative py-24 px-4 bg-gradient-to-b from-black to-background text-center overflow-hidden">
        <div className="container mx-auto max-w-4xl">
          <span className="text-primary text-xs font-black tracking-widest uppercase mb-4 block">Transporte de Funcionários</span>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black leading-tight mb-6">
            Fretamento de Van Executiva<br />
            <span className="text-primary">para Empresas e Funcionários em SP</span>
          </h1>
          <p className="text-white/70 text-base md:text-xl max-w-2xl mx-auto mb-10">
            Transporte diário de funcionários com pontualidade garantida, rastreamento em tempo real e contratos com nota fiscal. Mais de 20 anos atendendo empresas em todo o Brasil.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="https://wa.me/5511999294694?text=Ol%C3%A1!%20Gostaria%20de%20um%20or%C3%A7amento%20de%20fretamento%20corporativo." target="_blank" rel="noopener noreferrer">
              <button className="bg-primary text-black font-black rounded-full px-8 py-4 text-lg hover:bg-primary/90 transition-all">
                Solicitar Cotação Gratuita
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* DISCLAIMER JURÍDICO */}
      <section className="px-4 pb-0 pt-0">
        <div className="container mx-auto max-w-4xl">
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-[#1a1400]/80 to-[#0a0a0a]/80 p-5 flex gap-4 items-start">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Scale className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-primary font-black text-xs uppercase tracking-widest mb-1">Nota Jurídica — Modalidade de Operação</p>
              <p className="text-white/65 text-sm leading-relaxed">
                A VaideVan opera sob o regime de <strong className="text-white">locação de veículo com motorista</strong> (Código Civil, Lei 10.406/02 — arts. 565 e ss.), modalidade que{" "}
                <strong className="text-white">não configura transporte de passageiros nem fretamento</strong>, conforme jurisprudência consolidada do TJMG (Jurisp. Mineira, a. 55, n° 170, 2004). O motorista é serviço acessório ao contrato de locação. A atividade é regulada exclusivamente pelo direito privado contratual — independente de registro na ANTT, ARTESP, SPTRANS, EMTU, DER ou EMDEC.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-black text-center mb-4">Por que contratar Fretamento de Van Corporativo em São Paulo?</h2>
          <p className="text-white/60 text-center max-w-2xl mx-auto mb-14">Empresas que investem em transporte coletivo registram até 40% menos absenteísmo e aumento significativo na satisfação dos colaboradores.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: TrendingUp, title: "Redução de custos", desc: "O fretamento coletivo custa até 40% menos que o vale-transporte individualizado por colaborador." },
              { icon: Clock, title: "Pontualidade de 98,5%", desc: "SLA contratual de pontualidade. Penalidades em caso de descumprimento." },
              { icon: ShieldCheck, title: "Segurança certificada", desc: "Motoristas habilitados na categoria D, curso de direção defensiva e exame toxicológico." },
              { icon: Building2, title: "Contratos corporativos", desc: "Contratos mensais ou anuais com nota fiscal eletrônica e relatórios gerenciais." },
              { icon: FileText, title: "Rastreamento em tempo real", desc: "Painel de controle exclusivo para gestores de RH acompanharem cada veículo." },
              { icon: CheckCircle2, title: "Início em 48 horas", desc: "Da assinatura do contrato ao primeiro dia de operação: em até 48 horas." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl bg-card border border-white/10 p-6 hover:border-primary/40 transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-black text-lg mb-2">{title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section className="py-20 px-4 bg-card/50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-black text-center mb-14">Como funciona o Fretamento de Van Executiva para Empresas</h2>
          <div className="space-y-8">
            {[
              { step: "01", title: "Levantamento de necessidades", desc: "Nossa equipe analisa os pontos de coleta, horários de entrada/saída e número de colaboradores." },
              { step: "02", title: "Proposta e planejamento de rotas", desc: "Desenvolvemos um plano de rotas otimizado e apresentamos uma proposta com valores transparentes e SLA." },
              { step: "03", title: "Assinatura do contrato", desc: "Contrato flexível, mensal ou anual, com cláusulas de pontualidade, seguro e substituição de veículo." },
              { step: "04", title: "Início das operações", desc: "Em até 48 horas após a assinatura, seus colaboradores já estão sendo transportados." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <span className="text-primary font-black text-sm">{step}</span>
                </div>
                <div>
                  <h3 className="font-black text-lg mb-1">{title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-black text-center mb-12">Perguntas Frequentes sobre Fretamento de Van para Empresas</h2>
          <div className="space-y-4">
            {[
              { q: "Qual o valor do fretamento corporativo de van?", a: "O valor varia conforme a rota, frequência e número de colaboradores. Em geral, o custo por pessoa é inferior ao vale-transporte individual. Solicite uma cotação gratuita pelo WhatsApp +55 11 99929-4694." },
              { q: "A VaideVan emite nota fiscal?", a: "Sim. Emitimos nota fiscal eletrônica (NF-e) para todos os contratos corporativos." },
              { q: "Em quanto tempo começa o serviço?", a: "Em até 48 horas após a assinatura do contrato, o fretamento já está operando." },
              { q: "Qual a capacidade das vans?", a: "Nossas Mercedes-Benz Sprinter comportam de 10 a 15 passageiros com conforto, ar-condicionado e rastreamento GPS." },
              { q: "A VaideVan atende fora de São Paulo?", a: "Sim. Operamos em 12 estados e mais de 49 cidades em todo o Brasil." },
            ].map(({ q, a }) => (
              <div key={q} className="rounded-2xl bg-card border border-white/10 p-6">
                <h3 className="font-black mb-2">{q}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </ServiceLayout>
  );
}
