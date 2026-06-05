# VaideVan — Workspace

## Projeto

Site institucional e Portal do Investidor para vaidevan.com — transporte executivo de van premium com 20+ anos, marca registrada, 12 estados, 49+ cidades.

## Páginas Recentes

- **Blog 44 posts** — 26 Soro AI gerados em lote (bairros nobres SP + Jundiaí/Itupeva + diferenciais premium) + 18 WordPress = **44 posts** no banco. Scheduler diário às 08:00 BRT adiciona +1/dia automaticamente.
- **Parcerias B2B** — Nova seção "Onde está o público A+" na Home: Hotéis de Luxo (Fasano, Rosewood, Unique + Grand Hyatt, Emiliano) e Agências de Eventos Boutique (Casa Fasano, Estação Júlio Prestes, Villa Bisutti). CTA WhatsApp dedicado para parceiros.
- **SSL** — `.htaccess` com redirect HTTP→HTTPS (301 permanente) antes do SPA routing.
- **Logos coloridos** — BrandLogo sem grayscale: marcas parceiras em cor nativa, opacidade 60%→100% no hover.
- **417 CDI removido** — Substituído por "Sprinter Executive" em todos os 15+ arquivos (FAQs, Frota, Customização, portal, blog, prompts Soro AI, scheduler, motorista).
- **Sem compromisso removido** — Substituído por "orçamento personalizado" / "proposta personalizada".
- **"20 anos" profissional** — Apenas 1 menção no stat counter (20+); copy do simulador e seção de vídeo reformulados para "referência nacional" e "mais de duas décadas".
- **Mapa de rotas corrigido** — RouteSimulator e AddressAutocomplete usam `VITE_API_URL` em produção em vez de URL relativa hardcoded. Rate limit de direções reduzido a 5/min por IP (era 30).
- **Fotos de frota** — Imagens Unsplash atualizadas para veículos premium escuros nos cards de Vito, Sedã Executivo e SUV.
- **SEO Bairros Nobres** — 50+ keywords premium: Itaim Bibi, Vila Olímpia, Brooklin/Berrini/Chucri Zaidan, Jardins, Higienópolis, Alto de Pinheiros, Morumbi/Panamby, Moema, Vila Nova Conceição, Wi-Fi, motorista bilíngue, concierge, hotel 5 estrelas.
- **Sitemaps** — `sitemap.xml` (páginas principais) + `sitemap-blog.xml` (45 URLs estático) + `sitemap-index.xml` (índice de sitemaps) + endpoint dinâmico `GET /api/blog/sitemap.xml` (sempre atualizado com todos os posts do DB).
- **Indexação** — sitemaps prontos para submissão manual no Google Search Console e Bing Webmaster Tools (ping URL deprecated desde 2023).
- **.htaccess corrigido** — caminhos WordPress (`/wp-json/`, `/wp-admin/`, `/wp-content/` etc.) excluídos do redirect SPA — resolve bloqueio da API WP REST que impedia sync de posts.
- **Dashboard performance** — Endpoint unificado `/api/investor/dashboard` (119ms → 66ms). Índices DB em investor_id para financials, operations, vehicles, contracts.
- `/frota` — Página de frota completa com 7 modelos de veículos, logo VaideVan watermark, specs e CTAs de WhatsApp
- `/customizacao` — Configurador visual de interior 3D (CSS perspective) com 5 tiers: Essencial, Executive, JetVan, LimoVan, SpaceLimo + toggle de blindagem + Briefing WhatsApp
- RouteSimulator — suporte a até 20 paradas + "Mapa temporariamente indisponível" quando sem API key; tiles servidos via proxy `/api/maps/tiles/:z/:x/:y` (CartoDB server-side, evita bloqueio DNS no sandbox)
- Frota: modelo principal atualizado para **Sprinter 417 CDI** em todas as páginas, tradução e FAQ (removido "415")

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Auth**: JWT (jsonwebtoken) + bcryptjs
- **Frontend**: React + Vite + Tailwind + shadcn/ui + framer-motion (apenas Blog — Home.tsx usa IntersectionObserver nativo)
- **Fontes**: Bebas Neue self-hosted (H1/LCP), Space Grotesk (body — Google Fonts), Syne (display/headings + h1 italic highlight — Google Fonts)
- **Mapas**: react-leaflet + OpenStreetMap + Google Maps JavaScript API (`@googlemaps/js-api-loader` + `@types/google.maps`)
- **Gráficos**: Recharts
- **SEO**: react-helmet-async (Helmet per page + JSON-LD structured data)

## Artifacts

- `artifacts/vaidevan` — Site público + Portal do Investidor (porta 21992, path `/`)
- `artifacts/api-server` — API REST (porta 8080, path `/api`)

## Banco de Dados — Tabelas

| Tabela | Descrição |
|---|---|
| `investors` | Investidores com perfil completo (CPF, RG, endereço, Gov.br) |
| `clients` | Cadastro de clientes PF/PJ com endereço e vinculação Gov.br |
| `contract_templates` | Modelos de contrato editáveis com HTML + variáveis {{campo}} |
| `contracts` | Contratos ligados a investidor + cliente + template, com Gov.br |
| `operations` | Operações por investidor/cidade |
| `vehicles` | Rastreamento de frota (+ campo `tracker_url` para GPS físico) |
| `financials` | Registros financeiros por operação |
| `blog_posts` | Posts do blog (manual, webhook, Soro IA) |
| `webauthn_credentials` | Credenciais biométricas WebAuthn/Passkeys (Face ID, digital, Windows Hello) por usuário e tipo |
| `drivers` | Motoristas com telefone + PIN hash + URL de rastreador |
| `trips` | Viagens ativas/encerradas por motorista, com placa e modelo do veículo |
| `driver_locations` | Pings GPS (lat/lng/accuracy/speed/heading) por viagem, a cada 30s |

## Páginas do Site

### Home e Blog
- `/` — Home completa com hero, serviços, investidores, **depoimentos GMB (auto-carousel 10 cards, schema Review)**, FAQ, formulário de contato
- `/blog` — Blog com 20 posts, filtros de categoria, "load more" e posts relacionados
- `/blog/:slug` — Post individual com JSON-LD ArticleSchema

### Páginas de Serviço (SEO Long-Tail)
- `/fretamento-corporativo` — Fretamento de van para empresas
- `/transfer-aeroporto` — Transfer GRU / CGH / VCP
- `/van-para-eventos` — Van para eventos corporativos e sociais
- `/excursoes` — Excursões e passeios saindo de SP
- `/transporte-executivo` — Transporte executivo VIP

### Legais
- `/privacidade` — Política de Privacidade (LGPD)
- `/termos` — Termos de Uso

## Portal do Investidor

Demo: `investidor@vaidevan.com` / `vaidevan123`

- `/portal` — Login (e-mail + senha **ou Face ID / biometria**)
- `/portal/dashboard` — Visão geral financeira com gráficos
- `/portal/simulador` — **Simulador de Investimento** (6 modalidades, gráfico AreaChart 3 cenários, salva no DB via POST /api/investor/simulations)
- `/portal/financeiro` — Gráficos por categoria, lançamentos
- `/portal/propostas` — 4 modalidades de investimento detalhadas
- `/portal/veiculos` — Rastreamento legacy (Leaflet + OpenStreetMap)
- `/portal/rastreamento` — Rastreamento GPS de motoristas em tempo real + gestão de motoristas + links de rastreadores físicos
- `/portal/contratos` — Contratos de locação com assinatura via Gov.br
- `/portal/parceiros` — Gestão de cadastros de parceiros (CRUD completo)
- `/portal/modelos-contrato` — Editor de modelos de contrato (CCB Lei 10.406/02)

### Portal do Motorista (público, sem login de investidor)
- `/motorista` — Login por telefone + PIN; iniciar/encerrar viagem; enviar GPS a cada 30s; compartilhar localização via WhatsApp Live Location; abrir link do rastreador físico do veículo

## API Endpoints

- `GET /api/health` — Health check
- `POST /api/auth/login` — Login investidor (senha)
- `POST /api/webauthn/register/options` — Gerar opções de cadastro biométrico (requer JWT)
- `POST /api/webauthn/register/verify` — Verificar e armazenar credencial biométrica (requer JWT)
- `POST /api/webauthn/auth/options` — Gerar challenge de autenticação biométrica (público)
- `POST /api/webauthn/auth/verify` — Verificar autenticação biométrica → retorna JWT (público)
- `GET /api/webauthn/credentials` — Listar dispositivos biométricos cadastrados (requer JWT)
- `DELETE /api/webauthn/credentials/:id` — Remover dispositivo biométrico (requer JWT)
- `POST /api/webauthn/public/register/options` — Cadastro biométrico público (parceiros/clientes)
- `POST /api/webauthn/public/register/verify` — Verificar cadastro biométrico público
- `GET /api/webauthn/public/status` — Checar se email tem biometria cadastrada
- `GET /api/investor/*` — Dados do portal (protegidos)
- `POST /api/contact` — Formulário de contato → salva em `contact_leads` + envia email (SMTP) → vaidevan@icloud.com CC contato@vaidevan.com
- `POST /api/investor/simulations` — Salvar simulação no DB (requer JWT) + email de notificação
- `GET /api/investor/simulations` — Listar simulações do investidor (requer JWT + aprovado)
- `POST /api/partners` — Cadastro público de parceiros (nome, email, telefone, tipo, mensagem)
- `GET /api/partners` — Lista todos os parceiros (admin)
- `PATCH /api/partners/:id` — Atualiza status do parceiro (admin)
- `DELETE /api/partners/:id` — Remove parceiro (admin)

## DB Schema (lib/db/src/schema/)

- `investors` — dados dos investidores
- `investment_simulations` — **NOVO** simulações salvas pelo portal (investorId, modality, amount, months, 3-scenario returns, breakEven, ip, userAgent)
- `contact_leads` — **NOVO** leads do formulário de contato (name, phone, email, service, message, ip, userAgent)
- `operations` — operações por cidade/estado
- `vehicles` — veículos com lat/lng para rastreamento
- `financials` — lançamentos financeiros (income/expense por categoria)
- `contracts` — contratos de locação com status de assinatura
- `partners` — cadastros de parceiros (investidor/corporativo/revendedor/motorista)
- `webauthn_credentials` — credenciais Passkeys/WebAuthn (userId, userType, credentialId, publicKey, counter)

## Internacionalização (i18n)

- **Biblioteca**: react-i18next 17 + i18next-browser-languagedetector
- **Idiomas**: PT (padrão), EN, ES — arquivos em `src/locales/{pt,en,es}.json`
- **Detecção**: `localStorage("vv_lang")` → `navigator.language` → `htmlTag`
- **Query param**: `?lang=en` / `?lang=es` → detectado na inicialização, persiste em localStorage e remove param da URL
- **Hreflang**: `<link rel="alternate">` em index.html para pt-BR / en / es / x-default
- **LanguageSwitcher**: dropdown click-toggle com aria-haspopup/role=listbox, fecha ao clicar fora, presente no nav desktop e mobile
- **Cobertura**: 100% das strings visíveis em Home.tsx, ServiceLayout.tsx, BiometricVerify.tsx

## Core Web Vitals — Otimizações (PageSpeed: Mobile 64→~90+ / Desktop 88→~98+)

### Caminho Crítico de Execução — 314 kB uncompressed (~95 kB gzip)
| Chunk | Tamanho | Papel |
|---|---|---|
| `vendor-react` | 184 kB | React + ReactDOM — sempre necessário |
| `index` | 103 kB | Home + i18n + hero crítico |
| `vendor-icons` | 26 kB | Lucide (ícones hero) |
| **Total crítico** | **314 kB** | **(-30% vs 449 kB anterior)** |

### Chunks Lazy (fora do caminho crítico)
- `vendor-query` (27 kB) — TanStack Query, carregado via NonHomeRoutes
- `vendor-radix` (83 kB) — Radix UI (accordion, dialog etc.) — lazy via HomeFAQSection/NonHomeRoutes
- `PartnerModal` (14 kB) — lazy, carregado apenas ao abrir o modal
- `NonHomeRoutes` (12 kB) — todas as rotas não-Home + QueryClientProvider + Toaster
- `HomeFAQSection` (5 kB) — FAQ com Accordion — lazy
- `page-portal` (685 kB), `page-blog` (106 kB), `page-secondary` (119 kB), `page-forms` (100 kB) — todos lazy

### CSS Não-Bloqueante (index.html + vite.config.ts)
- Plugin Vite `non-blocking-css` transforma todos os `<link rel="stylesheet">` em `preload+onload` em produção
- `<noscript>` fallback preservado
- CSS crítico inline: `body { background: #0a0a0a; margin: 0 }` + `#root { min-height: 100vh }` → sem flash branco

### SSG-lite / LCP Estático (index.html)
- Hero H1 + logo + badge renderizados como HTML estático no `#root` antes do JS carregar
- Bebas Neue self-hosted (`/fonts/bebas-neue-latin.woff2`) com `<link rel="preload">`
- Google Fonts (Inter/Playfair/Syne) não-bloqueantes via `media="print" onload`
- LCP estimado: ~150 ms (era ~4 s com bundle bloqueante)

### Lazy Loading (App.tsx + NonHomeRoutes.tsx)
- Apenas Home é renderizada no bundle inicial
- Rotas não-Home: `React.lazy()` em `NonHomeRoutes.tsx` (inclui QueryClientProvider/Toaster)
- `fetchpriority="high"` no logo hero + preload de fonte crítica

### Code Splitting (vite.config.ts → rollupOptions.manualChunks)
- `vendor-react`, `vendor-icons` no bundle crítico; tudo mais lazy
- `treeshake.propertyReadSideEffects: false` para máximo tree-shaking

## SEO

### Sitemap (public/sitemap.xml)
- Home, 5 service pages, blog index, 20 blog posts, privacidade, termos
- `priority` adequado por tipo de página, `changefreq` correto

### robots.txt
- `Disallow: /portal/` e `/api/`
- `Sitemap: https://vaidevan.com/sitemap.xml`

### Google Analytics 4
- Comentado no index.html — ativar substituindo `G-XXXXXXXXXX` pelo Measurement ID real

## Variáveis de Ambiente Obrigatórias (Secrets)

| Variável | Descrição | Regras |
|---|---|---|
| `SESSION_SECRET` | Chave secreta para assinatura de JWTs | Qualquer string longa e aleatória |
| `ADMIN_PASSWORD` | Senha do painel de aprovação de investidores | **Mínimo 16 caracteres. Não pode ser um valor fraco/padrão.** O servidor recusa iniciar se não estiver definida ou for fraca. Gere com: `node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"` |
| `DATABASE_URL` | String de conexão PostgreSQL | `postgresql://user:pass@host/db` |

> **Atenção:** O servidor lança erro na inicialização se `ADMIN_PASSWORD` não estiver definida, usar a senha padrão antiga (`vaidevan-admin-2024`) ou ter menos de 16 caracteres.

## Key Commands

- `pnpm --filter @workspace/db run push` — push DB schema changes
- `pnpm --filter @workspace/api-server run dev` — run API server
- `pnpm --filter @workspace/vaidevan run dev` — run frontend
- `cd artifacts/vaidevan && VITE_API_URL="https://e71c45fc-2c00-4eb8-be6c-82311e3bc3c8-00-36rdq3rlnwgvc.kirk.replit.dev/api" BASE_PATH="/" PORT=21992 pnpm run build` — build produção (usa workspace dev API — 45 posts no banco dev)
- **Migração de posts para DB de produção**: após fazer deploy da API no Replit, rodar `bash /tmp/migrate-blog-to-prod.sh` ou chamar `POST /api/blog/bulk-import` com `x-webhook-key: vaidevan-blog-2025`

## Deploy Napoleon — Comando Fixo de Publicação do Frontend

Rodar no terminal do cPanel após qualquer atualização do site:

```bash
rm -f /tmp/vaidevan-final.tar.gz && \
wget -q "https://e71c45fc-2c00-4eb8-be6c-82311e3bc3c8-00-36rdq3rlnwgvc.kirk.replit.dev/api/deploy/package" -O /tmp/vaidevan-final.tar.gz && \
tar -xzf /tmp/vaidevan-final.tar.gz -C /home/vanjun51/vaidevan.com/ --overwrite && \
grep -o 'index-[A-Za-z0-9_-]*\.js' /home/vanjun51/vaidevan.com/index.html | head -1 && \
echo "✅ Deploy OK"
```

**Importante**: Sempre copiar o novo pacote também para `artifacts/api-server/vaidevan-napoleon-deploy.tar.gz` após novo build, pois o endpoint `/api/deploy/package` prioriza esse caminho.

## Customização — Imagens de Vans Geradas (IA)

Pasta: `artifacts/vaidevan/public/vans/`

| Arquivo | Descrição |
|---|---|
| `interior-essencial.png` | Interior Essencial (tecido, LED simples) |
| `interior-executive.png` | Interior Executive (couro, LED dourado, JBL) |
| `interior-jetvan.png` | Interior JetVan (estilo jato, LED azul, reclináveis) |
| `interior-limovan.png` | Interior LimoVan (frente a frente, gold, frigobar) |
| `interior-spacelimo.png` | Interior SpaceLimo (tela 4K, Dolby, LED roxo) |
| `exterior-sprinter417.png` | Exterior Sprinter 417 CDI |
| `exterior-sprinter517.png` | Exterior Sprinter 517 CDI |
| `exterior-master.png` | Exterior Renault Master L3H2 |
| `exterior-iveco.png` | Exterior Iveco Daily |
| `exterior-hiace.png` | Exterior Toyota HiAce |
| `exterior-scudo.png` | Exterior Fiat Scudo |

## Customização — Onde Editar Mensagens e Preços (Customizacao.tsx)

| O quê | Onde |
|---|---|
| Número WhatsApp | `const WHATSAPP_CUSTOM` (linha ~9) + `getBriefingWA()` (linha ~228) |
| Mensagem do Briefing | Função `getBriefingWA()` — template literal |
| Preços dos tiers | Array `TIERS` — campo `price` de cada tier |
| Notas dos tiers | Array `TIERS` — campo `priceNote` |
| Features de cada tier | Array `TIERS` — campo `features[]` |
| Preços dos pacotes | Array `PACKAGES` — campo `price` |
| Mensagem WhatsApp dos pacotes | Linha `href={...wa.me...}` em cada card de pacote |

## WordPress Theme — Napoleon Host (cPanel/LiteSpeed/MySQL)

Diretório: `vaidevan-wp2/vaidevan-theme/`
Plugin SEO Autopilot: `vaidevan-wp2/soro-seo/`

ZIPs prontos para upload no cPanel:
- `vaidevan-wp2/vaidevan-theme.zip` (602 KB) — tema principal
- `vaidevan-wp2/soro-seo.zip` (42 KB) — plugin Soro SEO Autopilot

Funcionalidades do tema:
- **Frota expandida**: Sprinter, Vito/V-Class, Passeio (BMW/MB), Blindado, Microônibus, Ônibus
- **Botão "Seja nosso parceiro"**: CTA no #seja-investidor → abre partnerModal
- **Partner Modal**: formulário HTML + AJAX → `wp_ajax_vdv_parceiro` → salva CPT "parceiro" + envia e-mail
- **CPT parceiro**: visível em WP Admin > Parceiros com custom fields
- **Quote Modal**: formulário de orçamento (já existia) via `wp_ajax_vdv_orcamento`
- **Contratos CCB**: modelos no portal com Lei 10.406/02, 10 cláusulas, assinatura digital
- **Google Maps**: embed seção `#como-chegar` com filtro dark e link GMB
- **GTM/GA4/Google Ads**: GTM-WPS2QGFK, GT-NFJ5PLCX, AW-1526613158

## Deploy — Napoleon Host

Arquivo: `vaidevan-napoleon-deploy.tar.gz` (gerado em `/home/runner/workspace/`)

Conteúdo do tar:
- `dist/public/` → copiar para `public_html/` no cPanel
- `public/sitemap.xml`, `robots.txt`, `manifest.json` → copiar para `public_html/`

Precisa de `.htaccess` para React Router SPA (já incluído via Vite build):
```
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QR,L]
```
