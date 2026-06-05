import { Router } from "express";
import { db } from "@workspace/db";
import { blogPostsTable } from "@workspace/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const SITE_BASE = "https://vaidevan.com";

const router = Router();

// ─── Webhook key (set BLOG_WEBHOOK_KEY env var) ─────────────────────────────
const WEBHOOK_KEY = process.env.BLOG_WEBHOOK_KEY || "vaidevan-blog-2025";

function slugify(text: string): string {
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

function estimateReadTime(content: string): string {
  const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min`;
}

// ─── Public: list published posts ────────────────────────────────────────────
router.get("/blog/posts", async (_req, res) => {
  try {
    const posts = await db
      .select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.published, true))
      .orderBy(desc(blogPostsTable.createdAt));
    res.json(posts);
  } catch {
    res.status(500).json({ error: "Erro ao buscar posts" });
  }
});

// ─── Public: single post by slug ─────────────────────────────────────────────
router.get("/blog/posts/:slug", async (req, res) => {
  try {
    const [post] = await db
      .select()
      .from(blogPostsTable)
      .where(eq(blogPostsTable.slug, req.params.slug))
      .limit(1);
    if (!post || !post.published) return res.status(404).json({ error: "Post não encontrado" });
    res.json(post);
  } catch {
    res.status(500).json({ error: "Erro ao buscar post" });
  }
});

// ─── Webhook: receive posts (e.g. from WordPress/Soro integration) ────────────
router.post("/blog/webhook", async (req, res) => {
  const key = req.headers["x-webhook-key"] || req.query.key;
  if (key !== WEBHOOK_KEY) {
    return res.status(401).json({ error: "Chave de webhook inválida" });
  }

  const { title, content, excerpt, image, category } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "title e content são obrigatórios" });
  }

  const slug = slugify(title) + "-" + Date.now().toString(36);
  const readTime = estimateReadTime(content);

  try {
    const [post] = await db
      .insert(blogPostsTable)
      .values({
        slug,
        title,
        content,
        excerpt: excerpt || title,
        image: image || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=80",
        category: category || "Geral",
        readTime,
        published: true,
        source: "webhook",
      })
      .returning();

    res.status(201).json({ id: post.id, slug: post.slug, message: "Post criado via webhook" });
  } catch {
    res.status(500).json({ error: "Erro ao criar post" });
  }
});

// ─── Protected: create post (portal admin) ────────────────────────────────────
router.post("/blog/posts", requireAuth, async (req, res) => {
  const { title, content, excerpt, image, category, published } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: "title e content são obrigatórios" });
  }

  const slug = slugify(title) + "-" + Date.now().toString(36);
  const readTime = estimateReadTime(content);

  try {
    const [post] = await db
      .insert(blogPostsTable)
      .values({
        slug,
        title,
        content,
        excerpt: excerpt || title,
        image: image || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=80",
        category: category || "Geral",
        readTime,
        published: published !== false,
        source: "manual",
      })
      .returning();

    res.status(201).json(post);
  } catch {
    res.status(500).json({ error: "Erro ao criar post" });
  }
});

// ─── Protected: update post ────────────────────────────────────────────────────
router.put("/blog/posts/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const { title, content, excerpt, image, category, published } = req.body;
  try {
    const [post] = await db
      .update(blogPostsTable)
      .set({
        ...(title && { title }),
        ...(content && { content, readTime: estimateReadTime(content) }),
        ...(excerpt !== undefined && { excerpt }),
        ...(image !== undefined && { image }),
        ...(category !== undefined && { category }),
        ...(published !== undefined && { published }),
        updatedAt: new Date(),
      })
      .where(eq(blogPostsTable.id, id))
      .returning();

    if (!post) return res.status(404).json({ error: "Post não encontrado" });
    res.json(post);
  } catch {
    res.status(500).json({ error: "Erro ao atualizar post" });
  }
});

// ─── Protected: delete post ────────────────────────────────────────────────────
router.delete("/blog/posts/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  try {
    await db.delete(blogPostsTable).where(eq(blogPostsTable.id, id));
    res.json({ message: "Post excluído" });
  } catch {
    res.status(500).json({ error: "Erro ao excluir post" });
  }
});

// ─── Protected: toggle publish ─────────────────────────────────────────────────
router.patch("/blog/posts/:id/toggle", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const [current] = await db.select().from(blogPostsTable).where(eq(blogPostsTable.id, id)).limit(1);
    if (!current) return res.status(404).json({ error: "Post não encontrado" });

    const [updated] = await db
      .update(blogPostsTable)
      .set({ published: !current.published, updatedAt: new Date() })
      .where(eq(blogPostsTable.id, id))
      .returning();

    res.json(updated);
  } catch {
    res.status(500).json({ error: "Erro ao alternar publicação" });
  }
});

// ─── Public: dynamic sitemap XML (all published posts) ───────────────────────
router.get("/blog/sitemap.xml", async (_req, res) => {
  try {
    const posts = await db
      .select({ slug: blogPostsTable.slug, updatedAt: blogPostsTable.updatedAt, createdAt: blogPostsTable.createdAt })
      .from(blogPostsTable)
      .where(eq(blogPostsTable.published, true))
      .orderBy(desc(blogPostsTable.createdAt));

    const today = new Date().toISOString().split("T")[0];
    const urls = posts.map(p => {
      const lastmod = (p.updatedAt ?? p.createdAt).toISOString().split("T")[0];
      return `  <url>
    <loc>${SITE_BASE}/blog/${p.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.80</priority>
    <lastmod>${lastmod}</lastmod>
  </url>`;
    }).join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_BASE}/blog</loc>
    <changefreq>daily</changefreq>
    <priority>0.85</priority>
    <lastmod>${today}</lastmod>
  </url>
${urls}
</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(xml);
  } catch {
    res.status(500).json({ error: "Erro ao gerar sitemap" });
  }
});

// ─── Bulk import: migrate posts from dev → production DB ─────────────────────
// Protected by webhook key. Accepts array of posts with custom slugs.
router.post("/blog/bulk-import", async (req, res) => {
  const key = req.headers["x-webhook-key"] || req.query.key;
  if (key !== WEBHOOK_KEY) {
    return res.status(401).json({ error: "Chave inválida" });
  }

  const { posts } = req.body as { posts?: unknown[] };
  if (!Array.isArray(posts) || posts.length === 0) {
    return res.status(400).json({ error: "posts[] é obrigatório" });
  }

  let inserted = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const p of posts) {
    const post = p as {
      slug: string; title: string; content: string; excerpt?: string;
      image?: string; category?: string; source?: string; published?: boolean;
      readTime?: string; read_time?: string; createdAt?: string; created_at?: string;
    };
    if (!post.slug || !post.title || !post.content) { skipped++; continue; }
    try {
      const result = await db
        .insert(blogPostsTable)
        .values({
          slug: post.slug,
          title: post.title,
          content: post.content,
          excerpt: post.excerpt || post.title,
          image: post.image || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=80",
          category: post.category || "Geral",
          source: post.source || "import",
          published: post.published !== false,
          readTime: post.readTime || post.read_time || estimateReadTime(post.content),
          createdAt: post.createdAt || post.created_at ? new Date(post.createdAt || post.created_at!) : new Date(),
        })
        .onConflictDoNothing();
      if ((result.rowCount ?? 0) > 0) inserted++;
      else skipped++;
    } catch (e: unknown) {
      errors.push(`${post.slug}: ${String(e).substring(0, 100)}`);
    }
  }

  res.json({ inserted, skipped, errors: errors.slice(0, 10), total: posts.length });
});

// ─── Protected: get all posts including drafts (for admin) ────────────────────
router.get("/blog/admin/posts", requireAuth, async (_req, res) => {
  try {
    const posts = await db
      .select()
      .from(blogPostsTable)
      .orderBy(desc(blogPostsTable.createdAt));
    res.json(posts);
  } catch {
    res.status(500).json({ error: "Erro ao buscar posts" });
  }
});

export default router;
