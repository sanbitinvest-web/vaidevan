import { ServiceLayout } from "@/components/ServiceLayout";
import { Star, ShieldCheck, Clock, Users, Briefcase, CheckCircle2 } from "lucide-react";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Transporte Executivo VIP — Van com Motorista SP",
  "provider": { "@type": "LocalBusiness", "name": "VaideVan", "url": "https://vaidevan.com" },
  "description": "Serviço de transporte executivo VIP com van Mercedes-Benz para CEOs, diretores, delegações e clientes especiais em São Paulo. Motorista uniformizado, discrição e pontualidade absoluta.",
  "serviceType": "Transporte Executivo VIP",
  "url": "https://vaidevan.com/transporte-executivo",
  "faqPage": {
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "O motorista fala inglês?", "acceptedAnswer": { "@type": "Answer", "text": "Para o serviço VIP, disponibilizamos motoristas bilíngues (português/inglês) mediante solicitação prévia." } },
      { "@type": "Question", "name": "O serviço executivo VIP inclui o quê?", "acceptedAnswer": { "@type": "Answer", "text": "Inclui veículo exclusivo, motorista uniformizado, placa de identificação no aeroporto, monitoramento de voo, água e amenidades a bordo e relatório de viagem." } }
    ]
  }
};

export default function TransporteExecutivo() {
  return (
    <ServiceLayout
      title="Transporte Executivo VIP em São Paulo | Van com Motorista | VaideVan"
      description="Transporte executivo VIP com van Mercedes-Benz e motorista uniformizado em SP. Recepção de CEOs, diretores e delegações. Discrição, pontualidade absoluta e padrão premium."
      canonical="https://vaidevan.com/transporte-executivo"
      keywords="transporte executivo VIP SP, van executiva CEO Faria Lima, motorista particular Jardins SP, transporte VIP Itaim Bibi, van executiva Higienópolis, transporte executivo Brooklin, van VIP Berrini SP, motorista dedicado Alphaville, van executiva Morumbi SP, van VIP Pinheiros SP, transporte CEO Paulista SP, van Mercedes Sprinter executivo premium, recepção delegações executivas nota fiscal, transporte executivo B2B São Paulo"
      whatsappContext="executive"
      structuredData={structuredData}
      breadcrumbName="Transporte Executivo VIP"
    >
      <section className="relative py-24 px-4 bg-gradient-to-b from-black to-background text-center overflow-hidden">
        <div className="container mx-auto max-w-4xl">
          <span className="text-primary text-xs font-black tracking-widest uppercase mb-4 block">Padrão Premium</span>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black leading-tight mb-6">
            Transporte Executivo VIP<br /><span className="text-primary">Van com Motorista Premium em SP</span>
          </h1>
          <p className="text-white/70 text-base md:text-xl max-w-2xl mx-auto mb-10">
            Receba CEOs, diretores, clientes internacionais e delegações com o padrão que eles merecem. Motorista uniformizado, veículo exclusivo e total discrição.
          </p>
          <a href="https://wa.me/5511999294694?text=Ol%C3%A1!%20Gostaria%20de%20um%20or%C3%A7amento%20de%20transporte%20executivo%20VIP." target="_blank" rel="noopener noreferrer">
            <button className="bg-primary text-black font-black rounded-full px-8 py-4 text-lg hover:bg-primary/90 transition-all">Solicitar Serviço VIP</button>
          </a>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-black text-center mb-4">O que está Incluso no Serviço de Transporte Executivo VIP com Van</h2>
          <p className="text-white/60 text-center max-w-2xl mx-auto mb-14">Cada detalhe do transporte executivo VIP é pensado para quem não pode se dar ao luxo de improvisar.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Star, title: "Veículo exclusivo", desc: "Mercedes-Benz Sprinter Executive ou Vito de última geração, dedicado exclusivamente ao seu passageiro." },
              { icon: ShieldCheck, title: "Motorista uniformizado", desc: "Profissional uniformizado, bilíngue (PT/EN) sob solicitação, com certificação de etiqueta executiva." },
              { icon: CheckCircle2, title: "Placa de identificação", desc: "No aeroporto, o motorista aguarda no saguão com placa personalizada com o nome do passageiro." },
              { icon: Clock, title: "Monitoramento de voo", desc: "O horário é ajustado automaticamente em caso de atraso ou adiantamento do voo." },
              { icon: Briefcase, title: "Amenidades a bordo", desc: "Água mineral, carregador USB, Wi-Fi e tablet disponíveis durante todo o trajeto." },
              { icon: Users, title: "Relatório de viagem", desc: "Relatório completo de cada deslocamento para o departamento financeiro da empresa." },
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

      <section className="py-20 px-4 bg-card/50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-black text-center mb-12">Quando Contratar Transporte Executivo VIP com Van Mercedes-Benz em SP</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "Recepção de executivos estrangeiros", desc: "A primeira impressão começa no aeroporto. Um transfer VIP bem executado transmite profissionalismo e respeito desde o desembarque." },
              { title: "CEOs e diretores em viagem", desc: "C-level executivos têm agendas apertadas. O transfer VIP garante pontualidade absoluta com rotas alternativas e suporte 24h." },
              { title: "Delegações governamentais", desc: "Visitas de autoridades exigem protocolos específicos, discrição e coordenação com equipes de segurança." },
              { title: "Eventos de gala e premiação", desc: "Chegar a um evento de gala em van executiva impecável, com motorista que abre a porta e aguarda o retorno, é o padrão VIP." },
              { title: "Reuniões de alto nível", desc: "Transporte de executivos entre hotéis, escritórios e centros de negócios com total conforto e privacidade." },
              { title: "Programas de incentivo", desc: "Transportar equipes premiadas com padrão VIP é um reconhecimento que fortalece a cultura e a motivação." },
            ].map(({ title, desc }) => (
              <div key={title} className="rounded-2xl bg-card border border-white/10 p-6">
                <h3 className="font-black text-base mb-2 text-primary">{title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-black text-center mb-12">Perguntas Frequentes sobre Transporte Executivo VIP em São Paulo</h2>
          <div className="space-y-4">
            {[
              { q: "O motorista fala inglês?", a: "Sim. Para o serviço VIP, disponibilizamos motoristas bilíngues (português/inglês) mediante solicitação prévia." },
              { q: "O serviço VIP inclui o quê?", a: "Veículo exclusivo, motorista uniformizado, placa no aeroporto, monitoramento de voo, água, amenidades e relatório de viagem." },
              { q: "Com quanto de antecedência devo agendar?", a: "Recomendamos pelo menos 24 horas de antecedência para garantir a disponibilidade do veículo e motorista corretos." },
              { q: "É possível contratar para múltiplos dias?", a: "Sim. Oferecemos contratos de transfer VIP por dia, semana ou mês para executivos em visita prolongada." },
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
