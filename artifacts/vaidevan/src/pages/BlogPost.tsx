import { motion } from "framer-motion";
import { Link, useParams } from "wouter";
import { Helmet } from "react-helmet-async";
import { Calendar, Clock, ArrowLeft, ArrowRight, Tag, ChevronRight } from "lucide-react";
import { getBlogPost, blogPosts as staticPosts } from "@/data/blogPosts";
import { api } from "@/lib/api";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

import { useTranslation } from "react-i18next";
import { waLink } from "@/lib/waLink";

function formatDate(dateStr: string) {
  const d = new Date(dateStr.includes("T") ? dateStr : dateStr + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

type NormalizedPost = {
  slug: string; title: string; excerpt: string; content: string;
  image: string; category: string; readTime: string; date: string;
};

export default function BlogPost() {
  const { i18n } = useTranslation();
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";
  const staticPost = getBlogPost(slug);

  const [post, setPost] = useState<NormalizedPost | null>(
    staticPost ? { ...staticPost, date: staticPost.date } : null
  );

  useEffect(() => {
    api.blogPosts()
      .then(apiPosts => {
        const found = apiPosts.find(p => p.slug === slug);
        if (found) {
          setPost({
            slug: found.slug, title: found.title, excerpt: found.excerpt,
            content: found.content, image: found.image, category: found.category,
            readTime: found.readTime, date: found.createdAt,
          });
        }
      })
      .catch(() => {/* use static */});
  }, [slug]);

  // Build combined post list for related/prev/next
  const [allPosts, setAllPosts] = useState<NormalizedPost[]>(
    staticPosts.map(p => ({ ...p }))
  );
  useEffect(() => {
    api.blogPosts()
      .then(apiPosts => {
        const norm = apiPosts.map(p => ({
          slug: p.slug, title: p.title, excerpt: p.excerpt, content: p.content,
          image: p.image, category: p.category, readTime: p.readTime, date: p.createdAt,
        }));
        const apiSlugs = new Set(norm.map(p => p.slug));
        const combined = [...norm, ...staticPosts.filter(p => !apiSlugs.has(p.slug))];
        setAllPosts(combined);
      })
      .catch(() => {});
  }, []);

  const blogPosts = allPosts;

  if (!post) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center flex-col gap-6">
        <h1 className="text-3xl font-black">Post não encontrado</h1>
        <Link href="/blog">
          <Button className="rounded-full bg-primary text-black font-bold">Voltar ao Blog</Button>
        </Link>
      </div>
    );
  }

  const related = blogPosts.filter(p => p.slug !== post.slug && p.category === post.category).slice(0, 3);
  const others = related.length < 3
    ? [...related, ...blogPosts.filter(p => p.slug !== post.slug && !related.includes(p)).slice(0, 3 - related.length)]
    : related;

  const currentIndex = blogPosts.findIndex(p => p.slug === post.slug);
  const prevPost = currentIndex > 0 ? blogPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < blogPosts.length - 1 ? blogPosts[currentIndex + 1] : null;

  const plainExcerpt = post.excerpt.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
  const metaDesc = plainExcerpt.length > 155
    ? plainExcerpt.substring(0, 152) + "..."
    : plainExcerpt;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>{post.title} | Blog VaideVan</title>
        <meta name="description" content={metaDesc} />
        <meta name="keywords" content={`${post.category}, transporte executivo, aluguel van executiva premium, VaideVan, locação van SP`} />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
        <link rel="canonical" href={`https://vaidevan.com/blog/${post.slug}`} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://vaidevan.com/blog/${post.slug}`} />
        <meta property="og:title" content={`${post.title} | Blog VaideVan`} />
        <meta property="og:description" content={metaDesc} />
        <meta property="og:image" content={post.image} />
        <meta property="og:locale" content="pt_BR" />
        <meta property="og:site_name" content="VaideVan" />
        <meta property="article:published_time" content={post.date} />
        <meta property="article:section" content={post.category} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${post.title} | Blog VaideVan`} />
        <meta name="twitter:description" content={metaDesc} />
        <meta name="twitter:image" content={post.image} />
      </Helmet>

      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" aria-label="VaideVan - Início">
            <img src="/logo-black-sm.webp" alt="VaideVan" className="h-12 w-auto object-contain cursor-pointer" width="48" height="48" />
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-semibold hover:text-primary transition-colors">Início</Link>
            <Link href="/#servicos" className="text-sm font-semibold hover:text-primary transition-colors">Serviços</Link>
            <Link href="/#seja-investidor" className="text-sm font-semibold hover:text-primary transition-colors">Seja Investidor</Link>
            <Link href="/blog" className="text-sm font-semibold text-primary">Blog</Link>
          </nav>
          <a href={waLink("blog", i18n.language)} target="_blank" rel="noopener noreferrer">
            <button className="font-bold rounded-full px-6 py-2.5 bg-primary text-black hover:bg-primary/90 text-sm transition-all">
              Solicitar Orçamento
            </button>
          </a>
        </div>
      </header>

      <main className="pt-32 pb-24 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-white/40 text-sm mb-10">
            <Link href="/" className="hover:text-white transition-colors">Início</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white/70 line-clamp-1">{post.title}</span>
          </nav>

          {/* Hero image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-3xl overflow-hidden mb-10 h-64 md:h-96"
          >
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="bg-primary/15 text-primary text-xs font-black rounded-full px-3 py-1 flex items-center gap-1">
                <Tag className="w-3 h-3" />{post.category}
              </span>
              <span className="text-white/40 text-sm flex items-center gap-1">
                <Calendar className="w-4 h-4" />{formatDate(post.date)}
              </span>
              <span className="text-white/40 text-sm flex items-center gap-1">
                <Clock className="w-4 h-4" />{post.readTime} de leitura
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">
              {post.title}
            </h1>

            <p className="text-white/60 text-xl leading-relaxed mb-12 border-l-4 border-primary pl-6">
              {post.excerpt}
            </p>

            {/* Content */}
            <div
              className="prose-vaidevan"
              style={{
                lineHeight: "1.8",
                color: "rgba(255,255,255,0.8)",
              }}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </motion.div>

          {/* CTA Block */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-16 rounded-3xl bg-primary/5 border border-primary/20 p-10 text-center"
          >
            <h3 className="text-2xl md:text-3xl font-black mb-4">
              Pronto para contratar a <span className="text-primary">VaideVan</span>?
            </h3>
            <p className="text-white/60 mb-8 max-w-xl mx-auto">
              Nossa equipe está de prontidão agora. Entre em contato pelo WhatsApp e receba sua proposta de forma imediata.
            </p>
            <a href={waLink("blog", i18n.language)} target="_blank" rel="noopener noreferrer">
              <Button className="h-12 px-10 font-black rounded-full bg-primary text-black hover:bg-primary/90">
                Falar no WhatsApp
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </a>
          </motion.div>

          {/* Navigation prev/next */}
          <div className="mt-12 grid md:grid-cols-2 gap-4">
            {prevPost && (
              <Link href={`/blog/${prevPost.slug}`}>
                <div className="group flex items-start gap-4 p-5 rounded-2xl bg-card border border-white/10 hover:border-primary/40 transition-all cursor-pointer">
                  <ArrowLeft className="w-5 h-5 text-primary mt-1 flex-shrink-0 group-hover:-translate-x-1 transition-transform" />
                  <div>
                    <p className="text-white/40 text-xs mb-1">Artigo anterior</p>
                    <p className="font-bold text-sm group-hover:text-primary transition-colors line-clamp-2">{prevPost.title}</p>
                  </div>
                </div>
              </Link>
            )}
            {nextPost && (
              <Link href={`/blog/${nextPost.slug}`}>
                <div className="group flex items-start gap-4 p-5 rounded-2xl bg-card border border-white/10 hover:border-primary/40 transition-all cursor-pointer md:text-right md:flex-row-reverse">
                  <ArrowRight className="w-5 h-5 text-primary mt-1 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                  <div>
                    <p className="text-white/40 text-xs mb-1">Próximo artigo</p>
                    <p className="font-bold text-sm group-hover:text-primary transition-colors line-clamp-2">{nextPost.title}</p>
                  </div>
                </div>
              </Link>
            )}
          </div>

          {/* Related posts */}
          {others.length > 0 && (
            <div className="mt-20">
              <h3 className="text-2xl font-black mb-8">Outros artigos sobre transporte executivo</h3>
              <div className="grid md:grid-cols-3 gap-5">
                {others.map((related) => (
                  <Link key={related.slug} href={`/blog/${related.slug}`}>
                    <div className="group rounded-2xl bg-card border border-white/10 hover:border-primary/40 hover:-translate-y-1 transition-all cursor-pointer h-full flex flex-col overflow-hidden">
                      {/* Imagem do post relacionado */}
                      <div className="relative h-44 overflow-hidden flex-shrink-0">
                        <img
                          src={related.image}
                          alt={related.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <span className="absolute top-3 left-3 bg-primary/90 text-black text-xs font-bold rounded-full px-2.5 py-1">
                          {related.category}
                        </span>
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <h4 className="font-black text-sm group-hover:text-primary transition-colors leading-snug flex-1 mb-3">
                          {related.title}
                        </h4>
                        <p className="text-white/30 text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />{related.readTime} de leitura
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer mínimo */}
      <footer className="bg-card border-t border-white/10 py-10 px-4 text-center">
        <Link href="/">
          <img src="/logo-black-sm.webp" alt="VaideVan" className="h-12 mx-auto mb-4 object-contain cursor-pointer" width="48" height="48" />
        </Link>
        <p className="text-white/30 text-sm">&copy; {new Date().getFullYear()} VaideVan. Todos os direitos reservados.</p>
      </footer>

      <WhatsAppButton />
    </div>
  );
}
