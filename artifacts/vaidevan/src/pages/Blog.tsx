import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Calendar, Clock, ArrowRight, Tag, LayoutGrid } from "lucide-react";
import { blogPosts as staticPosts } from "@/data/blogPosts";
import { WhatsAppButton } from "@/components/WhatsAppButton";

import { useTranslation } from "react-i18next";
import { waLink } from "@/lib/waLink";

type DisplayPost = {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  readTime: string;
  date: string;
};


function formatDate(dateStr: string) {
  const d = new Date(dateStr.includes("T") ? dateStr : dateStr + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

const ALL_CATEGORIES = "Todos";

function toDisplay(p: typeof staticPosts[0]): DisplayPost {
  return { slug: p.slug, title: p.title, excerpt: p.excerpt, image: p.image, category: p.category, readTime: p.readTime, date: p.date };
}

export default function Blog() {
  const { i18n } = useTranslation();
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES);
  const [visibleCount, setVisibleCount] = useState(10000);
  const [loading, setLoading] = useState(false);
  const [allPosts, setAllPosts] = useState<DisplayPost[]>(staticPosts.map(toDisplay));

  // Busca posts da API própria (sem depender do WordPress)
  useEffect(() => {
    const _ext = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? `${import.meta.env.BASE_URL.replace(/\/$/, "")}/api`;
    fetch(`${_ext}/blog/posts`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((apiPosts: Array<{ slug: string; title: string; excerpt: string; image: string; category: string; readTime: string; createdAt: string }>) => {
        if (!apiPosts?.length) return;
        const apiNorm: DisplayPost[] = apiPosts.map(p => ({
          slug: p.slug, title: p.title, excerpt: p.excerpt, image: p.image,
          category: p.category, readTime: p.readTime, date: p.createdAt,
        }));
        const apiSlugs = new Set(apiNorm.map(p => p.slug));
        const staticFallback = staticPosts.filter(p => !apiSlugs.has(p.slug)).map(toDisplay);
        setAllPosts([...apiNorm, ...staticFallback]);
      })
      .catch(() => { /* mantém posts estáticos */ });
  }, []);

  const categories = [ALL_CATEGORIES, ...Array.from(new Set(allPosts.map(p => p.category)))];
  const filtered = activeCategory === ALL_CATEGORIES ? allPosts : allPosts.filter(p => p.category === activeCategory);
  const featured = filtered[0];
  const rest = filtered.slice(1, visibleCount + 1);
  const hasMore = filtered.length > visibleCount + 1;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Blog VaideVan — Dicas de Transporte Executivo e Fretamento de Van</title>
        <meta name="description" content="Artigos especializados sobre transporte executivo, fretamento de van corporativa, transfer aeroporto, excursões e mobilidade urbana. Conteúdo atualizado pela equipe VaideVan." />
        <meta name="keywords" content="blog transporte executivo, fretamento van SP, dicas aluguel van, transfer aeroporto São Paulo, mobilidade corporativa, van executiva blog, VaideVan artigos" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
        <link rel="canonical" href="https://vaidevan.com/blog" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vaidevan.com/blog" />
        <meta property="og:title" content="Blog VaideVan — Dicas de Transporte Executivo e Fretamento de Van" />
        <meta property="og:description" content="Artigos especializados sobre transporte executivo, fretamento de van corporativa, transfer aeroporto e mobilidade urbana." />
        <meta property="og:image" content="https://vaidevan.com/opengraph.webp" />
        <meta property="og:locale" content="pt_BR" />
        <meta property="og:site_name" content="VaideVan" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Blog VaideVan — Dicas de Transporte Executivo" />
        <meta name="twitter:description" content="Artigos sobre transporte executivo, fretamento corporativo e transfer aeroporto." />
        <meta name="twitter:image" content="https://vaidevan.com/opengraph.webp" />
      </Helmet>

      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" aria-label="VaideVan - Início">
            <img src="/logo-black-sm.webp" alt="VaideVan" className="h-10 w-auto object-contain cursor-pointer" width="40" height="40" />
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-semibold hover:text-primary transition-colors">Início</Link>
            <Link href="/#servicos" className="text-sm font-semibold hover:text-primary transition-colors">Serviços</Link>
            <Link href="/#seja-investidor" className="text-sm font-semibold hover:text-primary transition-colors">Seja Investidor</Link>
            <Link href="/blog" className="text-sm font-semibold text-primary border-b border-primary pb-0.5">Blog</Link>
          </nav>
          <a href={waLink("blog", i18n.language)} target="_blank" rel="noopener noreferrer">
            <button className="font-bold rounded-full px-6 py-2 bg-primary text-black hover:bg-primary/90 text-sm transition-all">
              Solicitar Orçamento
            </button>
          </a>
        </div>
      </header>

      <main className="pt-28 pb-24 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Page title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="text-primary text-sm font-bold tracking-widest uppercase mb-4 block">Conteúdo especializado</span>
            <h1 className="text-5xl md:text-6xl font-black mb-4">Blog VaideVan</h1>
            <p className="text-white/60 text-xl max-w-2xl mx-auto">
              Dicas, guias e informações sobre transporte executivo, fretamento corporativo e mobilidade urbana.
            </p>
          </motion.div>

          {/* Category filter */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-wrap justify-center gap-2 mb-14"
          >
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setVisibleCount(10000); }}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all border ${
                  activeCategory === cat
                    ? "bg-primary text-black border-primary"
                    : "bg-transparent text-white/60 border-white/20 hover:border-primary/50 hover:text-white"
                }`}
              >
                {cat === ALL_CATEGORIES && <LayoutGrid className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />}
                {cat}
              </button>
            ))}
          </motion.div>

          {/* Featured post */}
          {featured && (
            <motion.article
              key={featured.slug}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mb-14"
            >
              <Link href={`/blog/${featured.slug}`}>
                <div className="group relative rounded-3xl bg-card border border-white/10 overflow-hidden hover:border-primary/40 transition-all cursor-pointer">
                  <div className="relative h-64 md:h-80 overflow-hidden">
                    <img
                      src={featured.image}
                      alt={featured.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                      onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&auto=format&fit=crop&q=80"; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-5 left-5">
                      <span className="bg-primary text-black text-xs font-black rounded-full px-3 py-1 flex items-center gap-1">
                        <Tag className="w-3 h-3" />{featured.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-8 md:p-10">
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                      <span className="text-white/40 text-sm flex items-center gap-1">
                        <Calendar className="w-4 h-4" />{formatDate(featured.date)}
                      </span>
                      <span className="text-white/40 text-sm flex items-center gap-1">
                        <Clock className="w-4 h-4" />{featured.readTime} de leitura
                      </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black mb-4 group-hover:text-primary transition-colors leading-tight">
                      {featured.title}
                    </h2>
                    <p className="text-white/60 text-lg leading-relaxed mb-6 max-w-3xl">
                      {featured.excerpt}
                    </p>
                    <span className="inline-flex items-center gap-2 text-primary font-bold group-hover:gap-4 transition-all">
                      Ler artigo completo <ArrowRight className="w-5 h-5" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.article>
          )}

          {/* Post grid */}
          {rest.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((post, i) => (
                <motion.article
                  key={post.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: Math.min(i * 0.07, 0.5) }}
                >
                  <Link href={`/blog/${post.slug}`}>
                    <div className="group h-full rounded-2xl bg-card border border-white/10 overflow-hidden hover:border-primary/40 hover:-translate-y-1 transition-all cursor-pointer flex flex-col">
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          loading="lazy"
                          onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&auto=format&fit=crop&q=80"; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute top-3 left-3">
                          <span className="bg-primary/90 text-black text-xs font-bold rounded-full px-2.5 py-1">
                            {post.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        <h3 className="text-lg font-black mb-3 group-hover:text-primary transition-colors leading-snug flex-1">
                          {post.title}
                        </h3>
                        <p className="text-white/50 text-sm leading-relaxed mb-4 line-clamp-2">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-white/30 text-xs">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />{formatDate(post.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />{post.readTime}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}

          {/* Load more */}
          {hasMore && (
            <div className="text-center mt-12">
              <button
                onClick={() => setVisibleCount(v => v + 24)}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-white/20 hover:border-primary hover:text-primary font-bold text-sm transition-all"
              >
                Ver mais artigos <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-24 text-white/40">
              <p className="text-xl font-bold">Nenhum artigo nesta categoria.</p>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-card border-t border-white/10 py-10 px-4 text-center">
        <Link href="/">
          <img src="/logo-black-sm.webp" alt="VaideVan" className="h-10 mx-auto mb-4 object-contain cursor-pointer" width="40" height="40" />
        </Link>
        <p className="text-white/30 text-sm">&copy; {new Date().getFullYear()} VaideVan. Todos os direitos reservados.</p>
      </footer>

      <WhatsAppButton />
    </div>
  );
}
