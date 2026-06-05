const WA_PHONE = "5511999294694";
const WA_BASE = `https://wa.me/${WA_PHONE}?text=`;

type Lang = "pt" | "en" | "es" | string;

export type WaContext =
  | "general"
  | "hero"
  | "investor"
  | "b2b"
  | "airport"
  | "events"
  | "tours"
  | "executive"
  | "corporate"
  | "blog"
  | "route"
  | "fleet"
  | "customization"
  | "buy_sell"
  | "partner"
  | "register";

const messages: Record<WaContext, Record<"pt" | "en" | "es", string>> = {
  general: {
    pt: "Olá! Vi o site da VaideVan e gostaria de saber mais sobre os serviços de locação de van executiva.",
    en: "Hello! I found VaideVan's website and I'd like to learn more about your executive van rental services.",
    es: "¡Hola! Encontré el sitio de VaideVan y me gustaría obtener más información sobre el alquiler de vans ejecutivas.",
  },
  hero: {
    pt: "Olá! Gostaria de um orçamento de van executiva premium.",
    en: "Hello! I'd like to get a quote for a premium executive van.",
    es: "¡Hola! Me gustaría cotizar una van ejecutiva premium.",
  },
  investor: {
    pt: "Olá! Tenho interesse em investir na VaideVan. Gostaria de receber informações sobre cotas, retorno e condições de entrada.",
    en: "Hello! I'm interested in investing with VaideVan. I'd like to learn about available shares, returns, and entry conditions.",
    es: "¡Hola! Me interesa invertir en VaideVan. Me gustaría recibir información sobre cuotas, retorno y condiciones de entrada.",
  },
  b2b: {
    pt: "Olá! Represento uma empresa e gostaria de conhecer as soluções B2B da VaideVan para locação de frota executiva.",
    en: "Hello! I represent a company and I'd like to learn about VaideVan's B2B corporate fleet rental solutions.",
    es: "¡Hola! Represento a una empresa y quisiera conocer las soluciones B2B de VaideVan para el alquiler de flota ejecutiva.",
  },
  airport: {
    pt: "Olá! Gostaria de um orçamento de transfer para aeroporto.",
    en: "Hello! I'd like a quote for airport transfer service.",
    es: "¡Hola! Me gustaría cotizar un servicio de transfer al aeropuerto.",
  },
  events: {
    pt: "Olá! Gostaria de um orçamento de van para evento.",
    en: "Hello! I'd like a quote for event transportation.",
    es: "¡Hola! Me gustaría cotizar el transporte para un evento.",
  },
  tours: {
    pt: "Olá! Gostaria de um orçamento de van para excursão em grupo.",
    en: "Hello! I'd like a quote for a group van tour.",
    es: "¡Hola! Me gustaría cotizar una excursión en van para grupo.",
  },
  executive: {
    pt: "Olá! Gostaria de um orçamento de transporte executivo VIP.",
    en: "Hello! I'd like a quote for VIP executive transportation.",
    es: "¡Hola! Me gustaría cotizar el transporte ejecutivo VIP.",
  },
  corporate: {
    pt: "Olá! Gostaria de um orçamento de locação corporativa de van.",
    en: "Hello! I'd like a quote for corporate van rental.",
    es: "¡Hola! Me gustaría cotizar el alquiler corporativo de van.",
  },
  blog: {
    pt: "Olá! Estava lendo o blog da VaideVan e gostaria de um orçamento de transporte executivo.",
    en: "Hello! I was reading the VaideVan blog and I'd like to get a quote for executive transportation.",
    es: "¡Hola! Estaba leyendo el blog de VaideVan y me gustaría cotizar el transporte ejecutivo.",
  },
  route: {
    pt: "Olá! Gostaria de simular uma rota e receber um orçamento com preço final.",
    en: "Hello! I'd like to get a quote for a specific route.",
    es: "¡Hola! Me gustaría cotizar una ruta específica y recibir el precio final.",
  },
  fleet: {
    pt: "Olá! Gostaria de conhecer a frota VaideVan e solicitar um orçamento.",
    en: "Hello! I'd like to learn about VaideVan's fleet and request a quote.",
    es: "¡Hola! Me gustaría conocer la flota de VaideVan y solicitar una cotización.",
  },
  customization: {
    pt: "Olá! Gostaria de informações sobre customização de van executiva VaideVan.",
    en: "Hello! I'd like information about VaideVan's executive van customization options.",
    es: "¡Hola! Me gustaría información sobre la personalización de vans ejecutivas VaideVan.",
  },
  buy_sell: {
    pt: "Olá! Tenho interesse em comprar ou vender uma van executiva pela VaideVan.",
    en: "Hello! I'm interested in buying or selling an executive van through VaideVan.",
    es: "¡Hola! Me interesa comprar o vender una van ejecutiva a través de VaideVan.",
  },
  partner: {
    pt: "Olá! Gostaria de saber mais sobre parcerias com a VaideVan.",
    en: "Hello! I'd like to learn more about partnering with VaideVan.",
    es: "¡Hola! Me gustaría saber más sobre las alianzas con VaideVan.",
  },
  register: {
    pt: "Olá! Gostaria de me cadastrar como cliente VaideVan.",
    en: "Hello! I'd like to register as a VaideVan client.",
    es: "¡Hola! Me gustaría registrarme como cliente de VaideVan.",
  },
};

function resolveLang(lang: Lang): "pt" | "en" | "es" {
  if (lang.startsWith("en")) return "en";
  if (lang.startsWith("es")) return "es";
  return "pt";
}

export function waLink(context: WaContext, lang: Lang): string {
  const l = resolveLang(lang);
  const msg = messages[context]?.[l] ?? messages.general[l];
  return WA_BASE + encodeURIComponent(msg);
}

export function waLinkCustom(text: string): string {
  return WA_BASE + encodeURIComponent(text);
}

export { WA_PHONE, WA_BASE };
