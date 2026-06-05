import { ServiceLayout } from "@/components/ServiceLayout";
import { CalendarDays, Users, Star, Clock, MapPin, CheckCircle2 } from "lucide-react";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Van para Eventos Corporativos e Sociais",
  "provider": { "@type": "LocalBusiness", "name": "VaideVan", "url": "https://vaidevan.com" },
  "description": "Locação de van executiva para eventos corporativos, shows, casamentos, formaturas e festas em São Paulo. Motorista profissional e pontualidade garantida.",
  "serviceType": "Transporte para Eventos",
  "url": "https://vaidevan.com/van-para-eventos",
  "faqPage": {
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "Com quanto de antecedência devo agendar a van para um evento?", "acceptedAnswer": { "@type": "Answer", "text": "Para eventos de grande porte ou datas concorridas (finais de semana, feriados), recomendamos agendar com pelo menos 15 dias de antecedência. Entre em contato pelo WhatsApp +55 11 99929-4694." } },
      { "@type": "Question", "name": "A van faz o retorno após o evento?", "acceptedAnswer": { "@type": "Answer", "text": "Sim. Oferecemos serviço completo de ida e volta. O motorista aguarda o término do evento conforme combinado previamente." } }
    ]
  }
};

export default function VanEventos() {
  return (
    <ServiceLayout
      title="Van para Eventos Corporativos e Sociais em SP | VaideVan"
      description="Locação de van executiva para eventos corporativos, shows, casamentos e formaturas em São Paulo. Mercedes-Benz Sprinter com motorista. Serviço de ida e volta. Agende agora."
      canonical="https://vaidevan.com/van-para-eventos"
      keywords="van para eventos SP, aluguel van casamento São Paulo, van eventos Morumbi SP, locação van casamento Jardins SP, van eventos corporativos Faria Lima, van para festas Higienópolis, van para formaturas Itaim Bibi SP, van shows Anhembi SP, van para convenções Vila Olímpia, locação van eventos Brooklin, van para feiras SP, transporte eventos corporativos nota fiscal"
      whatsappContext="events"
      structuredData={structuredData}
      breadcrumbName="Van para Eventos Corporativos e Sociais"
    >
      <section className="relative py-24 px-4 bg-gradient-to-b from-black to-background text-center overflow-hidden">
        <div className="container mx-auto max-w-4xl">
          <span className="text-primary text-xs font-black tracking-widest uppercase mb-4 block">Eventos e Celebrações</span>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black leading-tight mb-6">
            Locação de Van para Eventos<br /><span className="text-primary">Corporativos e Sociais em São Paulo</span>
          </h1>
          <p className="text-white/70 text-base md:text-xl max-w-2xl mx-auto mb-10">
            Shows, casamentos, formaturas, conferências e festas. Transporte seus convidados com conforto, pontualidade e total segurança — do início ao fim do evento.
          </p>
          <a href="https://wa.me/5511999294694?text=Ol%C3%A1!%20Gostaria%20de%20um%20or%C3%A7amento%20de%20van%20para%20evento." target="_blank" rel="noopener noreferrer">
            <button className="bg-primary text-black font-black rounded-full px-8 py-4 text-lg hover:bg-primary/90 transition-all">Solicitar Orçamento</button>
          </a>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-black text-center mb-4">Tipos de Eventos Atendidos com Locação de Van Executiva em SP</h2>
          <p className="text-white/60 text-center max-w-2xl mx-auto mb-14">Da corporativa à festa de família, a VaideVan tem a solução certa para cada tipo de evento.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: CalendarDays, title: "Conferências e congressos", desc: "Transporte de participantes entre hotéis, centros de convenção e aeroportos com cronograma rígido e controle de lista." },
              { icon: Star, title: "Casamentos e bodas", desc: "Transporte dos convidados especiais com ida e volta garantida. Pontualidade para a cerimônia e retorno seguro após a festa." },
              { icon: Users, title: "Formaturas", desc: "Van para levar família e amigos à colação de grau e à festa de formatura em locais diferentes." },
              { icon: MapPin, title: "Shows e festivais", desc: "Allianz Parque, Vibra São Paulo, Interlagos. Vá com o grupo, sem estresse de estacionamento ou app." },
              { icon: Clock, title: "Jantares corporativos", desc: "Eventos noturnos com retorno seguro para todos os convidados. Elimine a preocupação com quem vai dirigir." },
              { icon: CheckCircle2, title: "Feiras e exposições", desc: "Transporte contínuo de equipes entre parkings, metrô e pavilhões no Expo Center Norte, Anhembi e SP Expo." },
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
          <h2 className="text-3xl font-black text-center mb-12">Principais Locais de Eventos em São Paulo Atendidos pela VaideVan</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {["Allianz Parque","Vibra São Paulo","Espaço das Américas","Interlagos / Formula E","Expo Center Norte","Anhembi / Sambódromo","São Paulo Expo","Tokio Marine Hall","WTC Events Center","Teatro Municipal SP","Centro de Convenções","Blue Note SP"].map(local => (
              <div key={local} className="rounded-xl bg-card border border-white/10 p-3 text-center">
                <span className="text-sm font-bold text-white/80">{local}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-black text-center mb-12">Perguntas Frequentes sobre Locação de Van para Eventos em SP</h2>
          <div className="space-y-4">
            {[
              { q: "Com quanto de antecedência devo agendar?", a: "Para eventos de grande porte ou datas concorridas, recomendamos pelo menos 15 dias de antecedência." },
              { q: "A van faz o retorno após o evento?", a: "Sim. Oferecemos serviço completo de ida e volta. O motorista aguarda o término conforme combinado." },
              { q: "Quantas pessoas a van comporta?", a: "As vans Mercedes-Benz Sprinter comportam de 10 a 15 passageiros com conforto." },
              { q: "É possível alugar mais de uma van?", a: "Sim. Para eventos maiores, disponibilizamos frotas de 2 a 10 vans simultâneas com coordenação centralizada." },
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
