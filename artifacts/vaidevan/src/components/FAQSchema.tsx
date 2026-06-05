import { useEffect } from "react";

export function FAQSchema() {
  useEffect(() => {
    const faqData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Em quais estados a VaideVan oferece aluguel de van executiva?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A VaideVan oferece locação de vans executivas em 12 estados brasileiros: São Paulo, Rio de Janeiro, Minas Gerais, Paraná, Santa Catarina, Rio Grande do Sul, Bahia, Goiás, Mato Grosso, Mato Grosso do Sul, Espírito Santo e Ceará — em mais de 49 cidades."
          }
        },
        {
          "@type": "Question",
          "name": "Quais serviços de locação de van executiva a VaideVan oferece?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Oferecemos: aluguel de van para aeroporto (Guarulhos, Congonhas e Viracopos), locação de van corporativa, aluguel de van para eventos, fretamento de van executiva Sprinter, van para excursões em grupo e locação de van para viagens interestaduais em todo o Brasil."
          }
        },
        {
          "@type": "Question",
          "name": "Como solicitar orçamento para aluguel de van com motorista?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Solicite seu orçamento de locação de van executiva pelo WhatsApp: +55 11 99929-4694. Atendimento 24 horas por dia, 7 dias por semana. Resposta em menos de 1 hora."
          }
        },
        {
          "@type": "Question",
          "name": "A VaideVan possui qual modelo de van para locação?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A VaideVan opera com frota exclusiva de Mercedes-Benz Sprinter Executive — a van executiva premium do mercado, com ar-condicionado, conforto para até 15 passageiros e rastreamento em tempo real. Marca registrada no INPI, referência nacional em transporte de alto padrão."
          }
        },
        {
          "@type": "Question",
          "name": "Como funciona o modelo de investimento em locação de vans da VaideVan?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Oferecemos diferentes modelos de parceria para investidores no setor de aluguel de vans executivas. Entre em contato pelo WhatsApp para receber uma apresentação completa com projeções e condições exclusivas de investimento."
          }
        }
      ]
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.innerHTML = JSON.stringify(faqData);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return null;
}
