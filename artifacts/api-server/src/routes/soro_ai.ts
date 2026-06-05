import { Router } from "express";
import { anthropic } from "@workspace/integrations-anthropic-ai";
import { db } from "@workspace/db";
import { blogPostsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { runSoroNow } from "../soro_scheduler";
import { logger } from "../lib/logger";

const router = Router();

export const SORO_KEYWORDS = [
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
  // Bairros Nobres — Eixo Corporativo e Financeiro
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
  "van executiva Higienópolis SP",
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

// Mapeamento de categorias WP → categorias locais
const WP_CATEGORY_MAP: Record<string, string> = {
  "Traslado Aeroportuário": "Transfer Aeroporto",
  "Uncategorized": "Transporte Executivo",
  "Sem categoria": "Transporte Executivo",
};

// Pool de imagens variadas por categoria — mesmo pool do scheduler
const IMAGE_POOL: Record<string, string[]> = {
  "Transfer Aeroporto": [
    "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=1200&auto=format&fit=crop&q=80",
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
    "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&auto=format&fit=crop&q=80",
  ],
  "Segurança": [
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&auto=format&fit=crop&q=80",
  ],
  "Bairros Nobres": [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1549294413-26f195200c16?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80",
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

function pickImage(slug: string, category: string): string {
  const pool = IMAGE_POOL[category] ?? DEFAULT_IMAGES;
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  return pool[hash % pool.length]!;
}

function slugify(text: string): string {
  return text.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-")
    .replace(/-+/g, "-").slice(0, 100);
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').trim();
}

function estimateReadTime(content: string): string {
  const words = stripHtml(content).split(/\s+/).length;
  const mins = Math.max(1, Math.round(words / 200));
  return `${mins} min de leitura`;
}

// GET /api/soro/keywords
router.get("/soro/keywords", requireAuth, (_req, res) => {
  res.json(SORO_KEYWORDS);
});

// POST /api/soro/generate
router.post("/soro/generate", requireAuth, async (req, res) => {
  const { keyword, category, customTitle } = req.body as {
    keyword?: string;
    category?: string;
    customTitle?: string;
  };

  if (!keyword) {
    return res.status(400).json({ error: "Palavra-chave obrigatória" });
  }

  const titleInstruction = customTitle
    ? `Use exatamente este título: "${customTitle}"`
    : `Crie um título SEO otimizado (50-60 caracteres) que inclua a palavra-chave "${keyword}"`;

  const prompt = `Você é o Soro AI — escritor especializado em SEO para a VaideVan, empresa de aluguel de vans executivas Mercedes Sprinter em São Paulo e no Brasil (20+ anos, marca registrada, 12 estados, 49+ cidades, WhatsApp: +5511999294694).

Gere um artigo de blog completo, SEO-otimizado, em português brasileiro.
Palavra-chave principal: "${keyword}"
Categoria: ${category || "Transporte Executivo"}
Instrução de título: ${titleInstruction}

REQUISITOS:
- Mínimo 900 palavras, máximo 1.400 palavras
- Palavra-chave no 1º parágrafo, em pelo menos 2 subtítulos e na conclusão
- Tom: profissional, orientado ao cliente corporativo, confiante
- CTA no final com WhatsApp +5511999294694
- Mencione: "Mercedes Sprinter Executive", "referência nacional há mais de duas décadas", "12 estados", "49+ cidades"
- Use dados práticos e benefícios concretos
- HTML limpo: use <h2>, <h3>, <p>, <ul>, <li>, <strong> — SEM markdown

RESPONDA APENAS com um JSON válido, sem texto antes ou depois, sem backticks:
{
  "title": "Título do artigo (50-60 chars)",
  "seoTitle": "Meta title SEO (max 55 chars)",
  "seoDescription": "Meta description (150-160 chars)",
  "excerpt": "Resumo atrativo (max 200 chars)",
  "content": "<p>Conteúdo HTML completo aqui...</p>",
  "category": "${category || "Transporte Executivo"}",
  "imageQuery": "english terms for Unsplash image search"
}`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = message.content[0].type === "text" ? message.content[0].text : "";

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: "Resposta da IA inválida", preview: raw.slice(0, 300) });
    }

    let parsed: Record<string, string>;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      return res.status(500).json({ error: "JSON inválido retornado pela IA", preview: jsonMatch[0].slice(0, 300) });
    }

    const resolvedCategory = parsed.category ?? category ?? "Transporte Executivo";
    const tempSlug = slugify(parsed.title ?? keyword);
    const image = pickImage(tempSlug, resolvedCategory);

    res.json({
      title: parsed.title ?? "",
      seoTitle: parsed.seoTitle ?? "",
      seoDescription: parsed.seoDescription ?? "",
      excerpt: parsed.excerpt ?? "",
      content: parsed.content ?? "",
      category: resolvedCategory,
      image,
      imageQuery: parsed.imageQuery ?? "",
      keyword,
    });
  } catch (e: any) {
    res.status(500).json({ error: "Erro ao gerar post: " + (e.message ?? "desconhecido") });
  }
});

// POST /api/soro/run-now — disparo manual imediato
router.post("/soro/run-now", requireAuth, async (req, res) => {
  const { keyword, category } = req.body as { keyword?: string; category?: string };
  try {
    const result = await runSoroNow(keyword, category);
    res.json({ message: "Post gerado e publicado com sucesso", ...result });
  } catch (e: any) {
    res.status(500).json({ error: "Erro ao gerar post: " + (e.message ?? "desconhecido") });
  }
});

// POST /api/soro/sync-from-wp — importa todos os posts do WordPress para o banco local
router.post("/soro/sync-from-wp", requireAuth, async (req, res) => {
  const wpUrl = process.env.WP_URL ?? "";
  if (!wpUrl) {
    return res.status(500).json({ error: "WP_URL não configurado" });
  }

  try {
    // Buscar todos os posts do WP (suporte a paginação)
    let allWpPosts: any[] = [];
    let page = 1;
    while (true) {
      const url = `${wpUrl}/wp-json/wp/v2/posts?per_page=100&page=${page}&_embed=1&status=publish`;
      const resp = await fetch(url, {
        headers: { "Accept": "application/json" },
        signal: AbortSignal.timeout(20000),
      });
      if (!resp.ok) {
        if (resp.status === 400) break;
        throw new Error(`WP API retornou status ${resp.status}`);
      }
      const contentType = resp.headers.get("content-type") ?? "";
      if (!contentType.includes("json")) {
        const preview = (await resp.text()).slice(0, 120).replace(/\s+/g, " ").trim();
        throw new Error(
          `WordPress returned an unexpected response (content-type: ${contentType}). ` +
          `Isso indica que o .htaccess do Napoleon Host está desatualizado — ` +
          `faça upload do novo pacote vaidevan-napoleon-deploy.tar.gz para o cPanel. ` +
          `Preview: ${preview}`
        );
      }
      const data = await resp.json();
      if (!Array.isArray(data) || data.length === 0) break;
      allWpPosts = allWpPosts.concat(data);
      const totalPages = parseInt(resp.headers.get("X-WP-TotalPages") ?? "1", 10);
      if (page >= totalPages) break;
      page++;
    }

    if (allWpPosts.length === 0) {
      return res.json({ imported: 0, skipped: 0, total: 0, posts: [] });
    }

    // Buscar slugs já existentes no banco local
    const existing = await db.select({ slug: blogPostsTable.slug }).from(blogPostsTable);
    const existingSlugs = new Set(existing.map(r => r.slug));

    const imported: Array<{ title: string; slug: string }> = [];
    let skipped = 0;

    for (const wpPost of allWpPosts) {
      const title: string = stripHtml(wpPost.title?.rendered ?? "");
      if (!title || title.toLowerCase().includes("hello world")) {
        skipped++;
        continue;
      }

      const wpSlug: string = wpPost.slug ?? slugify(title);
      if (existingSlugs.has(wpSlug)) {
        skipped++;
        continue;
      }

      // Extrair categoria
      let category = "Transporte Executivo";
      const embeddedTerms = wpPost._embedded?.["wp:term"] ?? [];
      for (const termList of embeddedTerms) {
        for (const term of termList) {
          if (term.taxonomy === "category" && term.name !== "Uncategorized" && term.name !== "Sem categoria") {
            category = WP_CATEGORY_MAP[term.name] ?? term.name;
            break;
          }
        }
        if (category !== "Transporte Executivo") break;
      }

      // Extrair imagem
      let image = "";
      const featuredMedia = wpPost._embedded?.["wp:featuredmedia"];
      if (Array.isArray(featuredMedia) && featuredMedia[0]?.source_url) {
        image = featuredMedia[0].source_url;
      }
      if (!image) {
        image = pickImage(wpSlug, category);
      }

      // Extrair conteúdo e excerpt
      const content: string = wpPost.content?.rendered ?? "";
      const rawExcerpt: string = stripHtml(wpPost.excerpt?.rendered ?? "");
      const excerpt = rawExcerpt.length > 10 ? rawExcerpt.slice(0, 300) : stripHtml(content).slice(0, 200);
      const readTime = estimateReadTime(content);

      // Inserir no banco local
      const localSlug = existingSlugs.has(wpSlug) ? `${wpSlug}-wp` : wpSlug;
      await db.insert(blogPostsTable).values({
        slug: localSlug,
        title,
        excerpt,
        content,
        image,
        category,
        readTime,
        published: true,
        source: "wordpress",
        createdAt: new Date(wpPost.date ?? Date.now()),
      });

      existingSlugs.add(localSlug);
      imported.push({ title, slug: localSlug });
    }

    res.json({
      imported: imported.length,
      skipped,
      total: allWpPosts.length,
      posts: imported,
    });
  } catch (e: any) {
    res.status(500).json({ error: "Erro ao sincronizar: " + (e.message ?? "desconhecido") });
  }
});

// POST /api/soro/batch-generate — gera N posts em lote, resposta imediata
router.post("/soro/batch-generate", requireAuth, async (req, res) => {
  const { count = 10, keywords: customKeywords } = req.body as { count?: number; keywords?: string[] };
  const cap = Math.min(Number(count) || 10, 50);
  res.json({ status: "started", count: cap, message: `Gerando ${cap} posts em background — acompanhe nos logs` });

  // Executa em background sem bloquear a resposta
  (async () => {
    const kws: string[] = Array.isArray(customKeywords) && customKeywords.length
      ? customKeywords
      : SORO_KEYWORDS.slice(0, cap);
    let ok = 0, fail = 0;
    for (let i = 0; i < cap; i++) {
      try {
        const kw = kws[i % kws.length]!;
        await runSoroNow(kw);
        ok++;
        await new Promise(r => setTimeout(r, 3000)); // 3s entre chamadas à IA
      } catch (e) {
        logger.error({ err: e, index: i }, "Soro batch: erro ao gerar post");
        fail++;
      }
    }
    logger.info({ ok, fail, cap }, "Soro batch-generate concluído");
  })().catch(() => {});
});

// GET /api/soro/status — última execução e próximo horário
router.get("/soro/status", requireAuth, (_req, res) => {
  const now = new Date();
  const sp = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  const nextRun = new Date(sp);
  if (sp.getHours() >= 8) nextRun.setDate(nextRun.getDate() + 1);
  nextRun.setHours(8, 0, 0, 0);

  res.json({
    scheduler: "active",
    schedule: "08:00 BRT diariamente",
    currentTimeBRT: sp.toISOString(),
    nextRunBRT: nextRun.toISOString(),
  });
});

export default router;
