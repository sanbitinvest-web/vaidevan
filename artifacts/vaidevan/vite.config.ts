import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const rawPort = process.env.PORT;

// PORT is only required at runtime (dev server / preview).
// During `vite build` (deployment) it is not set — fall back to the
// known workflow port so the config resolves without error.
const port = rawPort ? Number(rawPort) : 21992;

if (rawPort && (Number.isNaN(port) || port <= 0)) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// BASE_PATH defaults to "/" in production builds.
const basePath = process.env.BASE_PATH ?? "/";

// Plugin 1: remove modulepreload para chunks lazy (portal, blog, leaflet, uppy…)
// Mantém apenas vendor-react e vendor-icons — os únicos necessários no load inicial
const filterModulePreloadPlugin = {
  name: "filter-modulepreload",
  enforce: "post" as const,
  transformIndexHtml(html: string) {
    if (process.env.NODE_ENV !== "production") return html;
    return html.replace(
      /<link rel="modulepreload" crossorigin href="\/assets\/([^"]+)">\n?/g,
      (match, filename) => {
        // Mantém apenas os chunks verdadeiramente síncronos
        if (filename.startsWith("vendor-react") || filename.startsWith("vendor-icons")) {
          return match;
        }
        return ""; // Remove preload de todos os chunks lazy
      },
    );
  },
};

// Plugin 2: CSS inteligente
// - CSS de chunks lazy (uppy, leaflet, portal…) → removido do HTML (Vite injeta dinamicamente quando o chunk carregar)
// - index.css (app principal) → preload não-bloqueante com fetchpriority high
const LAZY_CSS = /vendor-uppy|vendor-leaflet|vendor-maps|vendor-webauthn|page-portal|page-blog|page-secondary|page-forms|AdminPanel/;
const nonBlockingCssPlugin = {
  name: "non-blocking-css",
  enforce: "post" as const,
  transformIndexHtml(html: string) {
    if (process.env.NODE_ENV !== "production") return html;
    return html.replace(
      /<link rel="stylesheet" crossorigin href="([^"]+)">/g,
      (_match, href) => {
        // CSS de chunks lazy → não incluir no HTML (será injetado sob demanda)
        if (LAZY_CSS.test(href)) return "";
        // CSS principal da app → preload de alta prioridade, não-bloqueante
        return `<link rel="preload" as="style" crossorigin fetchpriority="high" onload="this.onload=null;this.rel='stylesheet'" href="${href}"><noscript><link rel="stylesheet" crossorigin href="${href}"></noscript>`;
      },
    );
  },
};

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    filterModulePreloadPlugin,
    nonBlockingCssPlugin,
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
      "react": path.resolve(import.meta.dirname, "node_modules/react"),
      "react-dom": path.resolve(import.meta.dirname, "node_modules/react-dom"),
      "react-dom/client": path.resolve(import.meta.dirname, "node_modules/react-dom/client"),
    },
    dedupe: ["react", "react-dom", "react-i18next", "i18next"],
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-dom/client",
      "react-i18next",
      "i18next",
      "i18next-browser-languagedetector",
    ],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    target: "es2020",
    minify: "esbuild",
    cssMinify: true,
    cssCodeSplit: true,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Google Maps — carregado sob demanda, chunk dedicado
          if (id.includes("@googlemaps") || id.includes("node_modules/google-maps")) return "vendor-maps";
          // Leaflet — usado apenas em portfólio/admin
          if (id.includes("node_modules/leaflet") || id.includes("node_modules/react-leaflet")) return "vendor-leaflet";
          // Framer Motion — blog e componentes animados
          if (id.includes("node_modules/framer-motion")) return "vendor-motion";
          // React core — sempre necessário, alto cache hit
          if (id.includes("node_modules/react-dom") || id.includes("node_modules/scheduler")) return "vendor-react";
          // TanStack Query
          if (id.includes("node_modules/@tanstack")) return "vendor-query";
          // Lucide icons — large, beneficia de cache longo
          if (id.includes("node_modules/lucide-react")) return "vendor-icons";
          // Radix UI — slot é minúsculo e usado no caminho crítico (button), fica inline
          // Os demais pacotes pesados (accordion, dialog, etc.) ficam no chunk lazy
          if (id.includes("node_modules/@radix-ui") && !id.includes("react-slot")) return "vendor-radix";
          // SimpleWebAuthn
          if (id.includes("node_modules/@simplewebauthn")) return "vendor-webauthn";
          // Uppy (upload de documentos — portal)
          if (id.includes("node_modules/@uppy")) return "vendor-uppy";
          // Componentes pesados do formulário de parceiro/investidor — lazy loaded
          if (
            id.includes("/components/BiometricVerify") ||
            id.includes("/components/portal/DocumentUploadField") ||
            id.includes("/components/portal/SelfieCapture") ||
            id.includes("/components/portal/CommercialRefsForm") ||
            id.includes("/components/ContactForm") ||
            id.includes("/components/QuoteModal")
          ) return "page-forms";
          // Portal do investidor (protegido, carregado apenas autenticado)
          if (id.includes("/pages/portal/")) return "page-portal";
          // Blog
          if (id.includes("/pages/Blog") || id.includes("/pages/BlogPost")) return "page-blog";
          // Páginas secundárias: serviços + legais + compra/venda + customização
          if (
            id.includes("/pages/services/") ||
            id.includes("/pages/Termos") ||
            id.includes("/pages/Privacidade") ||
            id.includes("/pages/CompraVenda") ||
            id.includes("/pages/Customizacao") ||
            id.includes("/pages/Reserva") ||
            id.includes("/pages/Pagamento") ||
            id.includes("/pages/PagamentoSucesso")
          ) return "page-secondary";
        },
        // Nomes de assets com hash — max cache lifetime no CDN
        assetFileNames: "assets/[name]-[hash][extname]",
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        compact: true,
      },
      treeshake: {
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },
  },
  define: {
    "import.meta.env.VITE_GOOGLE_API_KEY": JSON.stringify(process.env.VITE_GOOGLE_API_KEY ?? ""),
    "import.meta.env.VITE_GOOGLE_MAPS_API_KEY": JSON.stringify(process.env.VITE_GOOGLE_API_KEY ?? process.env.VITE_GOOGLE_MAPS_API_KEY ?? ""),
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
