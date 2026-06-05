import { ReactNode, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { QuoteModal } from "@/components/QuoteModal";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { Phone, ArrowRight } from "lucide-react";

import { waLink, waLinkCustom, type WaContext } from "@/lib/waLink";

interface ServiceLayoutProps {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
  keywords?: string;
  /** Texto estático de fallback (legacy) */
  whatsappText?: string;
  /** Contexto semântico — gera mensagem na língua detectada automaticamente */
  whatsappContext?: WaContext;
  children: ReactNode;
  structuredData?: object | object[];
  /** Nome da página para breadcrumb (ex: "Fretamento Corporativo") */
  breadcrumbName?: string;
}

export function ServiceLayout({
  title,
  description,
  canonical,
  ogImage = "https://vaidevan.com/opengraph.webp",
  keywords,
  whatsappText,
  whatsappContext,
  children,
  structuredData,
  breadcrumbName,
}: ServiceLayoutProps) {
  const { t, i18n } = useTranslation();
  const whatsappLink = whatsappContext
    ? waLink(whatsappContext, i18n.language)
    : waLinkCustom(whatsappText ?? "");
  const [quoteOpen, setQuoteOpen] = useState(false);

  const lang = i18n.language;
  const ogLocale = lang === "en" ? "en_US" : lang === "es" ? "es_ES" : "pt_BR";

  const breadcrumbData = breadcrumbName ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": t("nav.home"), "item": "https://vaidevan.com/" },
      { "@type": "ListItem", "position": 2, "name": breadcrumbName, "item": canonical },
    ],
  } : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <html lang={lang === "pt" ? "pt-BR" : lang} />
        <title>{title}</title>
        <meta name="description" content={description} />
        {keywords && <meta name="keywords" content={keywords} />}
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content={ogLocale} />
        <meta property="og:site_name" content="VaideVan" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
        {structuredData && (
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        )}
        {breadcrumbData && (
          <script type="application/ld+json">
            {JSON.stringify(breadcrumbData)}
          </script>
        )}
      </Helmet>

      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" aria-label="VaideVan - Início">
            <img
              src="/logo-black-sm.webp"
              alt="VaideVan — Aluguel de Vans Executivas"
              className="h-12 w-auto object-contain cursor-pointer"
              width="120"
              height="48"
              fetchPriority="high"
            />
          </Link>
          <nav className="hidden md:flex items-center gap-5" aria-label="Navegação">
            <Link href="/" className="text-sm font-semibold hover:text-primary transition-colors">{t("nav.home")}</Link>
            <Link href="/#servicos" className="text-sm font-semibold hover:text-primary transition-colors">{t("nav.services")}</Link>
            <Link href="/compra-venda" className="text-sm font-semibold hover:text-primary transition-colors">{t("nav.buySell")}</Link>
            <Link href="/customizacao" className="text-sm font-semibold hover:text-primary transition-colors">{t("nav.customize")}</Link>
            <Link href="/blog" className="text-sm font-semibold hover:text-primary transition-colors">{t("nav.blog")}</Link>
            <LanguageSwitcher />
          </nav>
          <button
            onClick={() => setQuoteOpen(true)}
            className="flex items-center gap-2 font-bold rounded-full px-5 py-2.5 bg-primary text-black hover:bg-primary/90 text-sm transition-all"
          >
            <Phone className="w-3.5 h-3.5" />
            {t("nav.quote")}
          </button>
        </div>
      </header>

      <main className="pt-20">
        {children}
      </main>

      {/* CTA FINAL */}
      <section className="bg-primary py-16 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-black text-black mb-4">
            {lang === "en" ? "Ready to book?" : lang === "es" ? "¿Listo para contratar?" : "Pronto para contratar?"}
          </h2>
          <p className="text-black/70 text-lg mb-8">
            {lang === "en"
              ? "Our team is on standby right now — instant quotes, no waiting."
              : lang === "es"
              ? "Nuestro equipo está en guardia ahora mismo — propuesta inmediata, sin esperas."
              : "Nossa equipe está de prontidão agora — proposta imediata, sem esperas."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setQuoteOpen(true)}
              className="inline-flex items-center justify-center gap-2 bg-black text-primary font-black rounded-full px-8 py-4 text-lg hover:bg-black/90 transition-all w-full sm:w-auto"
            >
              {t("nav.quote")} <ArrowRight className="w-5 h-5" />
            </button>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <button className="inline-flex items-center justify-center gap-2 bg-black/20 text-black border-2 border-black/30 font-black rounded-full px-8 py-4 text-lg hover:bg-black/30 transition-all w-full sm:w-auto">
                {t("hero.cta_whatsapp")}
              </button>
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-card border-t border-white/10 py-10 px-4 text-center">
        <Link href="/">
          <img
            src="/logo-black-sm.webp"
            alt="VaideVan"
            className="h-12 mx-auto mb-4 object-contain cursor-pointer"
            width="120"
            height="48"
          />
        </Link>
        <nav className="flex flex-wrap justify-center gap-4 mb-4 text-sm text-white/40">
          <Link href="/fretamento-corporativo" className="hover:text-primary transition-colors">{t("footer.s2")}</Link>
          <Link href="/transfer-aeroporto" className="hover:text-primary transition-colors">{t("footer.s1")}</Link>
          <Link href="/van-para-eventos" className="hover:text-primary transition-colors">{t("footer.s3")}</Link>
          <Link href="/excursoes" className="hover:text-primary transition-colors">{t("footer.s5")}</Link>
          <Link href="/transporte-executivo" className="hover:text-primary transition-colors">{t("footer.s4")}</Link>
          <Link href="/compra-venda" className="hover:text-primary transition-colors">{t("footer.s6")}</Link>
          <Link href="/customizacao" className="hover:text-primary transition-colors">{t("footer.s7")}</Link>
          <Link href="/privacidade" className="hover:text-primary transition-colors">{t("footer.s9")}</Link>
          <Link href="/termos" className="hover:text-primary transition-colors">{t("footer.s8")}</Link>
        </nav>
        <p className="text-white/30 text-sm">&copy; {new Date().getFullYear()} VaideVan. {t("footer.copyright")}</p>
      </footer>

      <WhatsAppButton />
      <QuoteModal open={quoteOpen} onOpenChange={setQuoteOpen} />
    </div>
  );
}
