import { ServiceLayout } from "@/components/ServiceLayout";
import { Plane, Clock, Users, MapPin, Star, CheckCircle2 } from "lucide-react";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Transfer Aeroporto São Paulo — Van Executiva",
  "provider": { "@type": "LocalBusiness", "name": "VaideVan", "url": "https://vaidevan.com" },
  "description": "Transfer de van executiva para os aeroportos de Guarulhos (GRU), Congonhas (CGH) e Viracopos (VCP). Motorista profissional, pontualidade garantida e monitoramento de voo.",
  "areaServed": "São Paulo, SP",
  "serviceType": "Transfer Aeroportuário",
  "url": "https://vaidevan.com/transfer-aeroporto",
  "faqPage": {
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "Quanto custa o transfer de van para o aeroporto de Guarulhos?", "acceptedAnswer": { "@type": "Answer", "text": "O valor varia conforme o ponto de origem e o número de passageiros. Para grupos de 3 ou mais pessoas, a van é mais econômica por pessoa do que apps de transporte. Solicite uma cotação pelo WhatsApp +55 11 99929-4694." } },
      { "@type": "Question", "name": "A VaideVan monitora o voo em caso de atraso?", "acceptedAnswer": { "@type": "Answer", "text": "Sim. O motorista acompanha o status do voo em tempo real e ajusta o horário de chegada automaticamente em caso de atraso." } },
      { "@type": "Question", "name": "A van busca no terminal correto?", "acceptedAnswer": { "@type": "Answer", "text": "Sim. O motorista aguarda no terminal de chegada indicado com placa de identificação. Basta informar o número do voo e terminal no momento do agendamento." } }
    ]
  }
};

export default function TransferAeroporto() {
  return (
    <ServiceLayout
      title="Transfer Aeroporto Guarulhos, Congonhas e Viracopos | Van VaideVan SP"
      description="Transfer de van executiva para Guarulhos (GRU), Congonhas (CGH) e Viracopos (VCP). Motorista profissional, pontualidade garantida e monitoramento de voo em tempo real. Agende já."
      canonical="https://vaidevan.com/transfer-aeroporto"
      keywords="transfer aeroporto Guarulhos GRU, transfer aeroporto Congonhas CGH, transfer Viracopos VCP, van transfer aeroporto SP, busca Faria Lima aeroporto GRU, transfer Itaim Bibi GRU Guarulhos, van Jardins aeroporto SP, transfer Moema CGH Congonhas, busca Higienópolis aeroporto van, transfer Brooklin aeroporto executivo, transfer Alphaville GRU, van Berrini aeroporto SP, aluguel van aeroporto São Paulo grupo, traslado aeroporto van executiva nota fiscal"
      whatsappContext="airport"
      structuredData={structuredData}
      breadcrumbName="Transfer Aeroporto — Van Executiva"
    >
      {/* HERO */}
      <section className="relative py-24 px-4 bg-gradient-to-b from-black to-background text-center overflow-hidden">
        <div className="container mx-auto max-w-4xl">
          <span className="text-primary text-xs font-black tracking-widest uppercase mb-4 block">Traslado Aeroportuário</span>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black leading-tight mb-6">
            Transfer Aeroporto São Paulo<br />
            <span className="text-primary">Van Executiva — GRU, CGH e VCP</span>
          </h1>
          <p className="text-white/70 text-base md:text-xl max-w-2xl mx-auto mb-6">
            Guarulhos, Congonhas e Viracopos. Chegue sem estresse, com pontualidade garantida, motorista profissional e monitoramento do seu voo em tempo real.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-10 text-sm">
            {["GRU — Guarulhos", "CGH — Congonhas", "VCP — Viracopos"].map(a => (
              <span key={a} className="flex items-center gap-1.5 border border-primary/40 rounded-full px-4 py-1.5 text-primary font-bold">
                <Plane className="w-3.5 h-3.5" />{a}
              </span>
            ))}
          </div>
          <a href="https://wa.me/5511999294694?text=Ol%C3%A1!%20Gostaria%20de%20um%20or%C3%A7amento%20de%20transfer%20para%20o%20aeroporto." target="_blank" rel="noopener noreferrer">
            <button className="bg-primary text-black font-black rounded-full px-8 py-4 text-lg hover:bg-primary/90 transition-all">
              Agendar Transfer
            </button>
          </a>
        </div>
      </section>

      {/* VANTAGENS */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-black text-center mb-4">Van Executiva de Transfer vs. Outras Opções de Transporte para Aeroporto</h2>
          <p className="text-white/60 text-center max-w-2xl mx-auto mb-14">Para grupos de 3 ou mais pessoas, a van executiva é a opção mais econômica, confortável e pontual.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Users, title: "Economize em grupo", desc: "O custo por pessoa é até 60% menor do que múltiplos carros de app para grupos de 4+ pessoas." },
              { icon: Clock, title: "Monitoramento de voo", desc: "O motorista acompanha o status do voo e ajusta o horário em caso de atraso — sem custo adicional." },
              { icon: MapPin, title: "Porta a porta", desc: "Embarque no seu endereço e desembarque direto no terminal correto, com assistência para a bagagem." },
              { icon: Star, title: "Padrão executivo", desc: "Vans Mercedes-Benz Sprinter climatizadas, limpas e com bagageiro amplo para malas volumosas." },
              { icon: CheckCircle2, title: "Placa de identificação", desc: "Na chegada, o motorista aguarda com placa personalizada no saguão de desembarque." },
              { icon: Plane, title: "24 horas, 7 dias", desc: "Voos madrugada, feriados ou finais de semana: a VaideVan opera sem interrupção." },
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

      {/* AEROPORTOS */}
      <section className="py-20 px-4 bg-card/50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-black text-center mb-12">Aeroportos de São Paulo Atendidos com Van Executiva</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { code: "GRU", name: "Guarulhos", full: "Aeroporto Internacional de Guarulhos — Governador André Franco Montoro", terminals: "Terminal 1, 2 e 3", desc: "O maior aeroporto do Brasil e da América Latina. Principal hub de voos internacionais e domésticos." },
              { code: "CGH", name: "Congonhas", full: "Aeroporto de Congonhas — Santos Dumont SP", terminals: "Terminal Doméstico", desc: "O aeroporto mais movimentado de voos domésticos de SP, localizado no coração da zona sul." },
              { code: "VCP", name: "Viracopos", full: "Aeroporto Internacional de Viracopos — Campinas", terminals: "Terminal Único", desc: "Principal aeroporto de Campinas, com voos Azul e conexões internacionais de carga." },
            ].map(({ code, name, full, terminals, desc }) => (
              <div key={code} className="rounded-2xl bg-card border border-white/10 p-6">
                <div className="text-4xl font-black text-primary mb-2">{code}</div>
                <h3 className="font-black text-lg mb-1">{name}</h3>
                <p className="text-white/40 text-xs mb-3">{full}</p>
                <div className="border-t border-white/10 pt-3 mb-3">
                  <span className="text-xs font-bold text-primary">{terminals}</span>
                </div>
                <p className="text-white/60 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-black text-center mb-12">Perguntas Frequentes sobre Transfer de Van para Aeroporto em SP</h2>
          <div className="space-y-4">
            {[
              { q: "Quanto custa o transfer de van para Guarulhos?", a: "O valor varia conforme o ponto de origem e número de passageiros. Solicite uma cotação pelo WhatsApp +55 11 99929-4694." },
              { q: "A VaideVan monitora o voo em caso de atraso?", a: "Sim. O motorista acompanha o status do voo em tempo real e ajusta o horário automaticamente em caso de atraso." },
              { q: "Com quanto tempo de antecedência devo agendar?", a: "Recomendamos pelo menos 24 horas de antecedência. Para feriados e alta temporada, agende com 48 a 72 horas." },
              { q: "O motorista aguarda no desembarque?", a: "Sim. O motorista aguarda no saguão de desembarque com placa de identificação personalizada com seu nome." },
              { q: "Há taxa para bagagem extra?", a: "Não cobramos taxa adicional para bagagem. As vans Sprinter têm amplo bagageiro para malas volumosas." },
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
