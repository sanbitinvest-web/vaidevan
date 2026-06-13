import { anthropic } from "@workspace/integrations-anthropic-ai";
import { db } from "@workspace/db";
import { blogPostsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "./lib/logger";
const SORO_KEYWORDS = [
    "aluguel de van executiva São Paulo",
    "fretamento corporativo São Paulo",
    "transfer aeroporto Guarulhos executivo",
    "transfer aeroporto Congonhas van",
    "van executiva para eventos SP",
    "van blindada aluguel SP",
    "van para excursões São Paulo",
    "locação van Mercedes Sprinter SP",
    "transporte executivo VIP São Paulo",
    "motorista executivo São Paulo",
    "fretamento van para empresas SP",
    "van para casamento São Paulo",
    "transfer hotel aeroporto SP",
    "van executiva Faria Lima",
    "van executiva Itaim Bibi",
    "van executiva Berrini",
    "contrato mensal van executiva empresa",
    "van interestadual com motorista",
    "aluguel sprinter executivo São Paulo",
    "transporte VIP corporativo SP",
    "van executiva para congressos SP",
    "van para transferência médica SP",
    "aluguel van 15 lugares São Paulo",
    "van executiva para viagem litoral SP",
    "fretamento van escolar executivo SP",
    // Jundiaí / Itupeva / Interior
    "aluguel de van executiva em Jundiaí SP",
    "transfer van Jundiaí aeroporto Guarulhos GRU",
    "van executiva Itupeva SP empresa",
    "fretamento corporativo Jundiaí interior SP",
    "van para eventos feiras Jundiaí SP",
    "translado executivo Jundiaí São Paulo",
    "van com motorista Itupeva Louveira Cabreúva",
    "transfer Jundiaí aeroporto Viracopos VCP",
    "fretamento van mensal empresa interior SP",
    // Bairros Nobres de SP — Eixo Corporativo e Financeiro
    "van executiva Itaim Bibi escritórios investimento SP",
    "van corporativa Vila Olímpia empresas tecnologia SP",
    "translado executivo Brooklin Berrini Chucri Zaidan SP",
    "van executiva Faria Lima Itaim Bibi SP",
    "van de luxo Brooklin Vila Olímpia SP",
    "transporte VIP comitiva executiva São Paulo",
    // Bairros Nobres — Residencial Tradicional
    "van executiva Jardins São Paulo",
    "aluguel van com motorista Jardim Europa Jardim Paulistano",
    "van executiva Jardim América Jardim Paulista SP",
    "van executiva Higienópolis SP elite intelectual",
    "van executiva Alto de Pinheiros SP",
    "van para casamento aniversário bairros nobres SP",
    // Bairros Nobres — Luxo e Condomínios
    "van VIP Morumbi Panamby residências diplomáticas SP",
    "transporte executivo Moema Aeroporto Congonhas SP",
    "van executiva Vila Nova Conceição Ibirapuera SP",
    "van para condomínio de luxo São Paulo",
    // Diferenciais Premium
    "van com Wi-Fi executiva reunião São Paulo",
    "van poltronas couro individuais USB ar-condicionado SP",
    "motorista bilíngue inglês espanhol van executiva SP",
    "transfer VIP aeroporto monitoramento voo em tempo real",
    "van executiva serviço concierge motorista uniformizado SP",
    "aluguel van executiva para jantar evento luxo SP",
    "transfer particular hotel 5 estrelas São Paulo",
    "van executiva Alphaville Barueri SP",
];
const CATEGORIES = [
    "Fretamento Corporativo",
    "Transfer Aeroporto",
    "Transporte Executivo",
    "Bairros Nobres",
    "Eventos",
    "Excursões",
    "Frota",
];
function slugify(text) {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 100);
}
// Pool de imagens variadas por categoria — evita imagem única em todos os posts
const IMAGE_POOL = {
    "Transfer Aeroporto": [
        "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1542296332-2e4473faf563?w=1200&auto=format&fit=crop&q=80",
    ],
    "Traslado Aeroportuário": [
        "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1542296332-2e4473faf563?w=1200&auto=format&fit=crop&q=80",
    ],
    "Fretamento Corporativo": [
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=1200&auto=format&fit=crop&q=80",
    ],
    "Transporte Executivo": [
        "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&auto=format&fit=crop&q=80",
    ],
    "Eventos": [
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&auto=format&fit=crop&q=80",
    ],
    "Excursões": [
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&auto=format&fit=crop&q=80",
    ],
    "Frota": [
        "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&auto=format&fit=crop&q=80",
    ],
    "Bairros Nobres": [
        "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1549294413-26f195200c16?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&auto=format&fit=crop&q=80",
    ],
};
const DEFAULT_IMAGES = [
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&auto=format&fit=crop&q=80",
];
function pickImage(slug, category) {
    const pool = IMAGE_POOL[category] ?? DEFAULT_IMAGES;
    // Hash determinístico pelo slug — mesmo post sempre recebe a mesma imagem
    let hash = 0;
    for (let i = 0; i < slug.length; i++)
        hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
    return pool[hash % pool.length];
}
function estimateReadTime(content) {
    const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
    const minutes = Math.max(1, Math.round(words / 200));
    return `${minutes} min`;
}
function getSaoPauloDate() {
    const now = new Date();
    const sp = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    const dayKey = `${sp.getFullYear()}-${String(sp.getMonth() + 1).padStart(2, "0")}-${String(sp.getDate()).padStart(2, "0")}`;
    return { hours: sp.getHours(), minutes: sp.getMinutes(), dayKey };
}
function pickKeyword(dayKey) {
    const seed = dayKey.replace(/-/g, "");
    const idx = parseInt(seed, 10) % SORO_KEYWORDS.length;
    const catIdx = parseInt(seed, 10) % CATEGORIES.length;
    return {
        keyword: SORO_KEYWORDS[idx] ?? SORO_KEYWORDS[0],
        category: CATEGORIES[catIdx] ?? CATEGORIES[0],
    };
}
async function postToWordPress(data) {
    const wpUrl = process.env.WP_URL;
    // Nota: usuário salvou os secrets invertidos; lemos na ordem real salva
    const wpUser = process.env.WP_APP_PASSWORD; // contém o login/username
    const wpAppPassword = process.env.WP_USER; // contém a App Password
    if (!wpUrl || !wpUser || !wpAppPassword) {
        logger.info("WordPress não configurado — salvando apenas no banco local");
        return null;
    }
    try {
        const credentials = Buffer.from(`${wpUser}:${wpAppPassword}`).toString("base64");
        const apiBase = wpUrl.replace(/\/$/, "") + "/wp-json/wp/v2";
        let categoryId = 1;
        try {
            const catRes = await fetch(`${apiBase}/categories?search=${encodeURIComponent(data.category)}&per_page=1`, {
                headers: { Authorization: `Basic ${credentials}` },
            });
            const cats = (await catRes.json());
            if (cats.length > 0 && cats[0]) {
                categoryId = cats[0].id;
            }
            else {
                const newCat = await fetch(`${apiBase}/categories`, {
                    method: "POST",
                    headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/json" },
                    body: JSON.stringify({ name: data.category }),
                });
                const created = (await newCat.json());
                categoryId = created.id ?? 1;
            }
        }
        catch {
            logger.warn("Não foi possível obter/criar categoria WP — usando padrão");
        }
        let featuredMediaId;
        try {
            const imgRes = await fetch(data.imageUrl);
            const imgBuffer = await imgRes.arrayBuffer();
            const filename = `soro-${data.slug}.jpg`;
            const mediaRes = await fetch(`${apiBase}/media`, {
                method: "POST",
                headers: {
                    Authorization: `Basic ${credentials}`,
                    "Content-Disposition": `attachment; filename="${filename}"`,
                    "Content-Type": "image/jpeg",
                },
                body: imgBuffer,
            });
            const media = (await mediaRes.json());
            featuredMediaId = media.id;
        }
        catch {
            logger.warn("Não foi possível fazer upload da imagem para o WordPress");
        }
        const postBody = {
            title: data.title,
            content: data.content,
            excerpt: data.excerpt,
            slug: data.slug,
            status: "publish",
            categories: [categoryId],
            meta: {
                _yoast_wpseo_title: data.seoTitle,
                _yoast_wpseo_metadesc: data.seoDescription,
                _soro_seo_title: data.seoTitle,
                _soro_seo_desc: data.seoDescription,
            },
        };
        if (featuredMediaId)
            postBody.featured_media = featuredMediaId;
        const postRes = await fetch(`${apiBase}/posts`, {
            method: "POST",
            headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/json" },
            body: JSON.stringify(postBody),
        });
        const post = (await postRes.json());
        if (!post.id)
            throw new Error("WordPress não retornou ID do post");
        logger.info({ wpPostId: post.id, wpUrl: post.link }, "Soro AI: post publicado no WordPress");
        return { wpPostId: post.id, wpUrl: post.link };
    }
    catch (err) {
        logger.error({ err }, "Soro AI: falha ao publicar no WordPress");
        return null;
    }
}
let lastPostedDate = "";
let isRunning = false;
/**
 * Verifica no banco se já há um post Soro publicado hoje (hora BRT).
 * Evita duplicação quando o servidor reinicia após as 08:00.
 */
async function hasTodaySoroPost(dayKey) {
    try {
        const rows = await db
            .select({ createdAt: blogPostsTable.createdAt })
            .from(blogPostsTable)
            .where(eq(blogPostsTable.source, "soro"))
            .limit(500);
        return rows.some((r) => {
            const brt = new Date(new Date(r.createdAt).toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
            const key = `${brt.getFullYear()}-${String(brt.getMonth() + 1).padStart(2, "0")}-${String(brt.getDate()).padStart(2, "0")}`;
            return key === dayKey;
        });
    }
    catch {
        return false;
    }
}
export async function runSoroNow(forceKeyword, forceCategory) {
    const { dayKey } = getSaoPauloDate();
    const { keyword, category } = forceKeyword
        ? { keyword: forceKeyword, category: forceCategory ?? "Transporte Executivo" }
        : pickKeyword(dayKey);
    logger.info({ keyword, category, dayKey }, "Soro AI: iniciando geração semântica SEO");
    const prompt = `Você é o Soro AI — especialista em SEO semântico para a VaideVan, líder em aluguel de vans executivas Mercedes Sprinter em São Paulo e no Brasil (20+ anos, marca registrada, 12 estados, 49+ cidades, WhatsApp: +5511999294694).

Crie um artigo de blog com outline SEO semântico completo para a palavra-chave: "${keyword}"
Categoria: ${category}

ESTRUTURA OBRIGATÓRIA — Outline SEO Semântico:

1. H1 — Deve conter a palavra-chave principal "${keyword}" de forma natural
2. De 5 a 8 seções H2 — organizadas do conceito básico até a aplicação prática
3. Cada H2 deve ter de 2 a 4 H3s que aprofundem o subtópico com termos que um especialista usaria
4. Para cada H2, incorpore naturalmente 5 termos semânticos relacionados que especialistas do setor usam
5. Última seção H2 obrigatória: "Perguntas Frequentes sobre ${keyword}" com 4 perguntas reais que pessoas buscam no Google, estruturadas como H3 + resposta em parágrafo

REQUISITOS DE CONTEÚDO:
- Mínimo 1.200 palavras, máximo 1.800 palavras
- Palavra-chave no 1º parágrafo, em pelo menos 2 H2s e na conclusão
- Tom: profissional, confiante, orientado ao cliente corporativo e executivo de alto padrão
- CTA no final com WhatsApp +5511999294694
- Mencione: "Mercedes Sprinter Executive", "referência nacional há mais de duas décadas", "12 estados", "49+ cidades"
- Quando a categoria for "Bairros Nobres" ou o keyword mencionar bairros premium (Jardins, Higienópolis, Moema, Morumbi, Faria Lima, Itaim, Alphaville, Brooklin, Berrini, Chucri Zaidan, Vila Olímpia, Alto de Pinheiros, Vila Nova Conceição, Morumbi, Panamby etc.):
  * Destaque: discrição absoluta, pontualidade britânica (5 min de atraso = prejuízo de milhões)
  * Interior premium: poltronas individuais em couro estilo aviação, tomadas USB em todos os assentos, ar-condicionado por zona
  * Wi-Fi de alta velocidade (requisito básico — executivos trabalham durante o trajeto)
  * Mimos: água mineral premium, revistas de negócios, entretenimento de alta qualidade
  * Motorista uniformizado com traje social, direção defensiva certificada, atendimento bilíngue (inglês/espanhol)
  * Monitoramento de voos em tempo real para transfers GRU/VCP — suporte total com bagagens
  * Filosofia "concierge": o cliente esquece que contratou — tudo funciona sem precisar perguntar
- Use dados práticos, benefícios concretos e linguagem de autoridade no setor
- HTML semântico limpo: use <h1>, <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em> — SEM markdown
- NÃO use <html>, <head>, <body> — apenas o conteúdo do artigo

RESPONDA APENAS com um JSON válido, sem texto antes ou depois, sem backticks:
{
  "title": "Título SEO do artigo (55-65 chars com palavra-chave)",
  "seoTitle": "Meta title otimizado (max 60 chars)",
  "seoDescription": "Meta description persuasiva (150-160 chars com CTA e palavra-chave)",
  "excerpt": "Resumo atrativo para listagem (max 200 chars)",
  "content": "<h1>...</h1><h2>...</h2>...<p>Conteúdo HTML semântico completo</p>",
  "category": "${category}",
  "imageQuery": "executive van mercedes sprinter corporate transport brazil"
}`;
    const message = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 8192,
        messages: [{ role: "user", content: prompt }],
    });
    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    /** Extrai um campo de string do JSON bruto via regex — fallback quando JSON.parse falha */
    function extractField(text, field) {
        // Captura o valor entre as aspas do campo, inclusive conteúdo multilinha/HTML
        const re = new RegExp(`"${field}"\\s*:\\s*"((?:[^"\\\\]|\\\\[\\s\\S])*)"`);
        const m = text.match(re);
        if (m)
            return m[1].replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\\\/g, "\\");
        // Fallback: extrai até próxima chave ou fim do JSON
        const re2 = new RegExp(`"${field}"\\s*:\\s*"([\\s\\S]*?)"(?:\\s*[,}])`);
        const m2 = text.match(re2);
        return m2 ? m2[1] : "";
    }
    let parsed;
    try {
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch)
            throw new Error("JSON não encontrado");
        parsed = JSON.parse(jsonMatch[0]);
    }
    catch {
        // JSON malformado (HTML com aspas não escapadas) — extrair campos individualmente
        logger.warn("Soro AI: JSON inválido, extraindo campos via regex");
        parsed = {
            title: extractField(raw, "title"),
            seoTitle: extractField(raw, "seoTitle"),
            seoDescription: extractField(raw, "seoDescription"),
            excerpt: extractField(raw, "excerpt"),
            content: extractField(raw, "content"),
            category: extractField(raw, "category"),
        };
    }
    if (!parsed.title || !parsed.content)
        throw new Error("Campos obrigatórios ausentes na resposta da IA");
    const slug = slugify(parsed.title) + "-" + Date.now().toString(36);
    const readTime = estimateReadTime(parsed.content);
    const image = pickImage(slug, parsed.category || category);
    await db.insert(blogPostsTable).values({
        slug,
        title: parsed.title,
        content: parsed.content,
        excerpt: parsed.excerpt || parsed.title,
        image,
        category: parsed.category || category,
        readTime,
        published: true,
        source: "soro",
    });
    const wpResult = await postToWordPress({
        title: parsed.title,
        content: parsed.content,
        excerpt: parsed.excerpt || parsed.title,
        seoTitle: parsed.seoTitle || parsed.title,
        seoDescription: parsed.seoDescription || "",
        category: parsed.category || category,
        imageUrl: image,
        slug,
    });
    lastPostedDate = dayKey;
    logger.info({ slug, keyword, wpPublished: !!wpResult }, "Soro AI: post gerado com sucesso");
    return { slug, title: parsed.title, keyword, wpUrl: wpResult?.wpUrl };
}
export function startSoroScheduler() {
    logger.info("Soro AI scheduler iniciado — publica todo dia às 08:00 BRT com SEO semântico");
    // ── Verificação no startup: se reiniciou após as 08:00 e não postou hoje, posta agora ──
    setTimeout(async () => {
        const { hours, dayKey } = getSaoPauloDate();
        if (hours >= 8) {
            const alreadyPosted = await hasTodaySoroPost(dayKey);
            if (alreadyPosted) {
                lastPostedDate = dayKey;
                logger.info({ dayKey }, "Soro AI: startup — post de hoje já existe, nada a fazer");
            }
            else {
                logger.info({ dayKey, hours }, "Soro AI: startup — post de hoje ausente, publicando agora");
                if (!isRunning) {
                    isRunning = true;
                    runSoroNow()
                        .then(({ slug, title, wpUrl }) => {
                        logger.info({ slug, title, wpUrl }, "Soro AI: post de recuperação publicado");
                    })
                        .catch((err) => logger.error({ err }, "Soro AI: falha no post de recuperação"))
                        .finally(() => { isRunning = false; });
                }
            }
        }
    }, 5000); // aguarda 5s para o DB estar pronto
    // ── Loop principal: verifica todo minuto se chegou 08:00 ──
    setInterval(() => {
        const { hours, minutes, dayKey } = getSaoPauloDate();
        if (hours === 8 && minutes === 0 && lastPostedDate !== dayKey && !isRunning) {
            isRunning = true;
            runSoroNow()
                .then(({ slug, title, wpUrl }) => logger.info({ slug, title, wpUrl }, "Soro AI: publicação diária concluída"))
                .catch((err) => logger.error({ err }, "Soro AI: falha na publicação diária"))
                .finally(() => { isRunning = false; });
        }
    }, 60 * 1000);
}
//# sourceMappingURL=soro_scheduler.js.map