import { ServiceLayout } from "@/components/ServiceLayout";
import { MapPin, Clock, Users, Star, CheckCircle2, Bus } from "lucide-react";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "TouristTrip",
  "name": "Excursões de Van a partir de São Paulo",
  "provider": { "@type": "LocalBusiness", "name": "VaideVan", "url": "https://vaidevan.com" },
  "description": "Excursões e passeios de van a partir de São Paulo. Campos do Jordão, litoral paulista, Aparecida, Brotas, Serra da Mantiqueira e muito mais. Grupos de 8 a 15 pessoas.",
  "url": "https://vaidevan.com/excursoes",
  "faqPage": {
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": "Qual o valor de uma excursão de van saindo de São Paulo?", "acceptedAnswer": { "@type": "Answer", "text": "O valor varia conforme o destino, a distância e o número de passageiros. Em geral, para grupos de 10 a 15 pessoas, o custo por pessoa é muito competitivo. Solicite uma cotação pelo WhatsApp +55 11 99929-4694." } },
      { "@type": "Question", "name": "A VaideVan aceita grupos de igrejas e associações?", "acceptedAnswer": { "@type": "Answer", "text": "Sim. Atendemos grupos religiosos, associações, clubes, empresas e grupos de amigos. O serviço é personalizado para cada tipo de grupo." } }
    ]
  }
};

const roteiros = [
  { destino: "Campos do Jordão", km: "170 km", tempo: "2h30", desc: "A 'Suíça brasileira' — chocolaterias, fondue, Morro do Elefante e Festival de Inverno em julho." },
  { destino: "Guarujá e Santos", km: "80 km", tempo: "1h30", desc: "As praias mais clássicas dos paulistanos. Orla, Pitangueiras e Guarujá Beach sem estacionamento." },
  { destino: "Aparecida do Norte", km: "170 km", tempo: "2h", desc: "A Basílica de Nossa Senhora Aparecida — o santuário mariano mais visitado do Brasil." },
  { destino: "Brotas", km: "240 km", tempo: "3h", desc: "Capital do ecoturismo: rapel, canoagem, tirolesa, cachoeiras e aventura na natureza." },
  { destino: "Ubatuba", km: "230 km", tempo: "3h", desc: "102 praias de Mata Atlântica preservada. Ideal para grupos que buscam natureza e tranquilidade." },
  { destino: "Holambra", km: "130 km", tempo: "2h", desc: "A cidade das flores — especialmente na ExpoFlora. Ambiente holandês e gastronomia típica." },
];

export default function Excursoes() {
  return (
    <ServiceLayout
      title="Excursões de Van a partir de São Paulo | VaideVan — Passeios em Grupo"
      description="Excursões de van com motorista saindo de São Paulo. Campos do Jordão, litoral, Aparecida, Brotas e mais de 49 destinos. Grupos de 8 a 15 pessoas. Agende sua excursão."
      canonical="https://vaidevan.com/excursoes"
      keywords="excursões de van SP, van para excursão São Paulo, passeios de van grupo SP, van para Campos do Jordão, van para litoral SP, excursão van Aparecida Brotas, aluguel van passeio turismo SP, excursão van saindo dos Jardins SP, van passeio Higienópolis grupo, van turismo Morumbi SP, excursão van Faria Lima SP, van passeio Itaim Bibi empresa, van lazer grupo empresa SP"
      whatsappContext="tours"
      structuredData={structuredData}
      breadcrumbName="Excursões de Van — Passeios em Grupo"
    >
      <section className="relative py-24 px-4 bg-gradient-to-b from-black to-background text-center overflow-hidden">
        <div className="container mx-auto max-w-4xl">
          <span className="text-primary text-xs font-black tracking-widest uppercase mb-4 block">Passeios e Turismo</span>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black leading-tight mb-6">
            Excursões de Van com Motorista<br /><span className="text-primary">Saindo de São Paulo — 49+ Destinos</span>
          </h1>
          <p className="text-white/70 text-base md:text-xl max-w-2xl mx-auto mb-10">
            Litoral, serra, cidades históricas e destinos de aventura. Viaje em grupo com conforto, segurança e sem preocupação com trânsito ou estacionamento.
          </p>
          <a href="https://wa.me/5511999294694?text=Ol%C3%A1!%20Gostaria%20de%20um%20or%C3%A7amento%20para%20excurs%C3%A3o%20de%20van." target="_blank" rel="noopener noreferrer">
            <button className="bg-primary text-black font-black rounded-full px-8 py-4 text-lg hover:bg-primary/90 transition-all">Planejar Excursão</button>
          </a>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-black text-center mb-4">Roteiros de Excursão Mais Populares a partir de São Paulo</h2>
          <p className="text-white/60 text-center max-w-2xl mx-auto mb-14">Mais de 49 destinos atendidos em São Paulo e outros estados. Escolha o seu e agende com a VaideVan.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roteiros.map(({ destino, km, tempo, desc }) => (
              <div key={destino} className="rounded-2xl bg-card border border-white/10 p-6 hover:border-primary/40 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-black text-lg">{destino}</h3>
                  <span className="text-primary text-xs font-bold border border-primary/30 rounded-full px-2 py-0.5">{km}</span>
                </div>
                <div className="flex items-center gap-1 text-white/40 text-xs mb-3">
                  <Clock className="w-3 h-3" />{tempo} de São Paulo
                </div>
                <p className="text-white/60 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-card/50">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-black text-center mb-14">Por que Contratar Van com Motorista para Excursões em Grupo</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Users, title: "Grupos de 8 a 15", desc: "Todos viajam juntos, sem separação e sem risco de alguém se perder no caminho." },
              { icon: Star, title: "Motorista experiente", desc: "Motoristas com amplo conhecimento das estradas do interior e litoral paulista." },
              { icon: Bus, title: "Van climatizada", desc: "Ar-condicionado eficiente, bancos confortáveis e bagageiro amplo para todos." },
              { icon: CheckCircle2, title: "Sem preocupações", desc: "Esqueça estacionamento, pedágio e combustível. Focam apenas na viagem." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-black mb-2">{title}</h3>
                <p className="text-white/60 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl font-black text-center mb-12">Perguntas Frequentes sobre Excursões de Van a partir de São Paulo</h2>
          <div className="space-y-4">
            {[
              { q: "Qual o valor de uma excursão de van?", a: "O valor varia conforme o destino e o número de passageiros. Para grupos de 10 a 15 pessoas, o custo por pessoa é muito competitivo. Solicite cotação pelo WhatsApp +55 11 99929-4694." },
              { q: "A VaideVan atende grupos religiosos e de igrejas?", a: "Sim. Atendemos grupos religiosos, pastorais, associações e clubes com serviço personalizado." },
              { q: "É possível fazer excursão em final de semana?", a: "Sim. Atendemos nos 7 dias da semana, inclusive feriados e alta temporada." },
              { q: "O motorista pode aguardar no destino?", a: "Sim. O motorista aguarda no destino pelo tempo combinado, ou segue um cronograma de ida e volta definido previamente." },
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
