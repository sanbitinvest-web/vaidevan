import { useEffect, useState, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { api } from "@/lib/api";
import {
  Plus, Trash2, Eye, EyeOff, Edit3, X, Check, Globe, Zap,
  Sparkles, RefreshCw, ChevronDown, Copy, ExternalLink, Clock, Play,
  Download, Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Post = {
  id: number; slug: string; title: string; excerpt: string;
  content: string; image: string; category: string; readTime: string;
  published: boolean; source: string; createdAt: string;
};

type GeneratedPost = {
  title: string; seoTitle: string; seoDescription: string;
  excerpt: string; content: string; category: string;
  image: string; imageQuery: string; keyword: string;
};

const CATEGORIES = [
  "Fretamento Corporativo", "Transfer Aeroporto", "Eventos", "Excursões",
  "Transporte Executivo", "Bairros Nobres", "Frota", "Segurança", "Geral",
];

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
  // Jundiaí / Itupeva / Interior
  "aluguel de van executiva em Jundiaí SP",
  "transfer van Jundiaí aeroporto Guarulhos GRU",
  "van executiva Itupeva SP empresa",
  "fretamento corporativo Jundiaí interior SP",
  "translado executivo Jundiaí São Paulo",
  "van com motorista Itupeva Louveira Cabreúva",
  "transfer Jundiaí aeroporto Viracopos VCP",
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

const EMPTY_FORM = { title: "", excerpt: "", content: "", image: "", category: "Geral", published: true };

type Tab = "posts" | "soro" | "webhook";

export default function BlogAdmin() {
  const [tab, setTab] = useState<Tab>("posts");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [form, setForm] = useState<typeof EMPTY_FORM>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Soro AI state
  const [soroKeyword, setSoroKeyword] = useState(SORO_KEYWORDS[0]);
  const [soroCustomKeyword, setSoroCustomKeyword] = useState("");
  const [soroCategory, setSoroCategory] = useState("Transporte Executivo");
  const [soroCustomTitle, setSoroCustomTitle] = useState("");
  const [soroGenerating, setSoroGenerating] = useState(false);
  const [soroError, setSoroError] = useState("");
  const [soroResult, setSoroResult] = useState<GeneratedPost | null>(null);
  const [soroPublishing, setSoroPublishing] = useState(false);
  const [soroPublished, setSoroPublished] = useState(false);
  const [soroPreviewMode, setSoroPreviewMode] = useState<"html" | "rendered">("rendered");

  const [webhookKey] = useState("vaidevan-blog-2025");

  // WP Sync state
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ imported: number; skipped: number; total: number; posts: Array<{ title: string; slug: string }> } | null>(null);
  const [syncError, setSyncError] = useState("");

  // Scheduler state
  const [schedulerStatus, setSchedulerStatus] = useState<{ nextRunBRT: string; currentTimeBRT: string } | null>(null);
  const [runningAuto, setRunningAuto] = useState(false);
  const [autoResult, setAutoResult] = useState<{ title: string; slug: string } | null>(null);
  const [autoError, setAutoError] = useState("");

  async function load() {
    try {
      const data = await api.blogAdminPosts();
      setPosts(data);
    } catch {
      setError("Erro ao carregar posts");
    } finally {
      setLoading(false);
    }
  }

  const fetchSchedulerStatus = useCallback(async () => {
    try {
      const _ext = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? `${import.meta.env.BASE_URL.replace(/\/$/, "")}/api`;
      const res = await fetch(`${_ext}/soro/status`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("vdv_token")}` },
      });
      if (res.ok) setSchedulerStatus(await res.json());
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { load(); fetchSchedulerStatus(); }, [fetchSchedulerStatus]);

  async function handleSyncFromWP() {
    setSyncing(true); setSyncError(""); setSyncResult(null);
    try {
      const result = await api.syncBlogFromWP();
      setSyncResult(result);
      if (result.imported > 0) load();
    } catch (e: any) {
      setSyncError(e.message || "Erro ao sincronizar com WordPress");
    } finally {
      setSyncing(false);
    }
  }

  async function handleRunNow() {
    setRunningAuto(true); setAutoError(""); setAutoResult(null);
    try {
      const _ext2 = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? `${import.meta.env.BASE_URL.replace(/\/$/, "")}/api`;
      const res = await fetch(`${_ext2}/soro/run-now`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("vdv_token")}`,
        },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao gerar post");
      setAutoResult({ title: data.title, slug: data.slug });
      load();
    } catch (e: any) {
      setAutoError(e.message || "Erro ao gerar post automático");
    } finally {
      setRunningAuto(false);
    }
  }

  function openNew() {
    setEditing(null); setForm(EMPTY_FORM); setShowForm(true); setError("");
  }

  function openEdit(p: Post) {
    setEditing(p);
    setForm({ title: p.title, excerpt: p.excerpt, content: p.content, image: p.image, category: p.category, published: p.published });
    setShowForm(true); setError("");
  }

  async function handleSave(asDraft?: boolean) {
    if (!form.title || !form.content) { setError("Título e conteúdo são obrigatórios"); return; }
    setSaving(true); setError("");
    try {
      const published = asDraft === true ? false : form.published;
      if (editing) { await api.updateBlogPost(editing.id, { ...form, published }); }
      else { await api.createBlogPost({ ...form, published }); }
      setShowForm(false); load();
    } catch (e: any) { setError(e.message || "Erro ao salvar"); }
    finally { setSaving(false); }
  }

  async function handleToggle(id: number) {
    try { await api.toggleBlogPost(id); load(); }
    catch { setError("Erro ao alternar publicação"); }
  }

  async function handleDelete(id: number) {
    if (!confirm("Excluir este post permanentemente?")) return;
    try { await api.deleteBlogPost(id); load(); }
    catch { setError("Erro ao excluir post"); }
  }

  async function handleSoroGenerate() {
    const keyword = soroCustomKeyword.trim() || soroKeyword;
    if (!keyword) { setSoroError("Informe uma palavra-chave"); return; }
    setSoroGenerating(true); setSoroError(""); setSoroResult(null); setSoroPublished(false);
    try {
      const _ext3 = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? `${import.meta.env.BASE_URL.replace(/\/$/, "")}/api`;
      const res = await fetch(`${_ext3}/soro/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("vdv_token")}`,
        },
        body: JSON.stringify({
          keyword,
          category: soroCategory,
          customTitle: soroCustomTitle.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erro desconhecido" }));
        throw new Error(err.error || "Erro ao gerar post");
      }
      const data: GeneratedPost = await res.json();
      setSoroResult(data);
    } catch (e: any) {
      setSoroError(e.message || "Erro ao gerar post com IA");
    } finally {
      setSoroGenerating(false);
    }
  }

  async function handleSoroPublish(asDraft = false) {
    if (!soroResult) return;
    setSoroPublishing(true); setSoroError("");
    try {
      await api.createBlogPost({
        title: soroResult.title,
        content: soroResult.content,
        excerpt: soroResult.excerpt,
        image: soroResult.image,
        category: soroResult.category,
        published: !asDraft,
      });
      setSoroPublished(true);
      load();
      setTimeout(() => setTab("posts"), 1500);
    } catch (e: any) {
      setSoroError(e.message || "Erro ao publicar");
    } finally {
      setSoroPublishing(false);
    }
  }

  function useSoroInEditor() {
    if (!soroResult) return;
    setForm(prev => ({
      ...prev,
      title: soroResult.title,
      excerpt: soroResult.excerpt,
      content: soroResult.content,
      image: soroResult.image,
      category: soroResult.category,
    }));
    setEditing(null);
    setShowForm(true);
    setTab("posts");
  }

  const apiBaseUrl = `${window.location.protocol}//${window.location.hostname.replace(/:\d+/, "")}:8080`;

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "posts", label: "Posts", icon: <Globe className="w-4 h-4" /> },
    { id: "soro", label: "Soro AI", icon: <Sparkles className="w-4 h-4" /> },
    { id: "webhook", label: "Webhook", icon: <Zap className="w-4 h-4" /> },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-white">Blog VaideVan</h1>
            <p className="text-white/50 mt-1">Gerencie posts e gere conteúdo com IA</p>
          </div>
          {tab === "posts" && (
            <Button onClick={openNew} className="h-11 rounded-full bg-primary text-black font-black flex items-center gap-2 px-6">
              <Plus className="w-4 h-4" />Nova Postagem
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-card border border-white/10 rounded-2xl p-1.5 mb-6 w-fit">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                tab === t.id
                  ? t.id === "soro" ? "bg-primary text-black" : "bg-primary/10 text-primary"
                  : "text-white/40 hover:text-white"
              }`}
            >
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {error && <p className="text-red-400 text-sm bg-red-400/10 rounded-xl px-4 py-3 mb-4">{error}</p>}

        {/* ── TAB: POSTS ─────────────────────────────────────────────── */}
        {tab === "posts" && (
          loading ? (
            <div className="grid gap-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-card rounded-2xl animate-pulse" />)}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 text-white/30">
              <Globe className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-bold">Nenhuma postagem ainda</p>
              <p className="text-sm mt-1">Crie um post manualmente ou use o Soro AI</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {posts.map(p => (
                <div key={p.id} className="bg-card border border-white/10 rounded-2xl p-5 flex items-start gap-4">
                  {p.image && (
                    <img src={p.image} alt={p.title} className="w-16 h-16 object-cover rounded-xl flex-shrink-0 hidden md:block" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs font-bold rounded-full px-2 py-0.5 ${p.published ? "bg-green-400/10 text-green-400" : "bg-white/10 text-white/40"}`}>
                        {p.published ? "Publicado" : "Rascunho"}
                      </span>
                      <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">{p.category}</span>
                      {(p.source === "soro" || p.source === "soro-ai") && (
                        <span className="text-xs bg-purple-400/10 text-purple-400 rounded-full px-2 py-0.5 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />Soro AI
                        </span>
                      )}
                      {p.source === "webhook" && (
                        <span className="text-xs bg-blue-400/10 text-blue-400 rounded-full px-2 py-0.5 flex items-center gap-1">
                          <Zap className="w-2.5 h-2.5" />webhook
                        </span>
                      )}
                      {p.source === "wordpress" && (
                        <span className="text-xs bg-sky-400/10 text-sky-400 rounded-full px-2 py-0.5 flex items-center gap-1">
                          <Database className="w-2.5 h-2.5" />WordPress
                        </span>
                      )}
                    </div>
                    <h3 className="font-black text-white text-sm line-clamp-1">{p.title}</h3>
                    <p className="text-white/40 text-xs mt-0.5">{p.readTime} · {new Date(p.createdAt).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => handleToggle(p.id)} title={p.published ? "Despublicar" : "Publicar"}
                      className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                      {p.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-red-400/10 text-white/40 hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ── TAB: SORO AI ───────────────────────────────────────────── */}
        {tab === "soro" && (
          <div className="flex flex-col gap-6">

            {/* Painel de Sincronização WordPress */}
            <div className="bg-card border border-blue-400/20 rounded-3xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-400/10 flex items-center justify-center flex-shrink-0">
                    <Database className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="font-black text-white">Sincronizar do WordPress</h2>
                    <p className="text-white/40 text-xs mt-0.5">
                      Importa todos os posts do WordPress para o blog do portal — fiel em conteúdo e imagens
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleSyncFromWP}
                  disabled={syncing}
                  className="h-9 rounded-full bg-blue-400/10 text-blue-400 hover:bg-blue-400 hover:text-white border border-blue-400/30 font-bold text-xs flex items-center gap-2 px-4 flex-shrink-0"
                >
                  {syncing
                    ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" />Sincronizando...</>
                    : <><Download className="w-3.5 h-3.5" />Sincronizar agora</>
                  }
                </Button>
              </div>
              {syncError && <p className="text-red-400 text-xs bg-red-400/10 rounded-xl px-4 py-2 mt-4">{syncError}</p>}
              {syncResult && (
                <div className={`mt-4 rounded-xl px-4 py-3 border ${syncResult.imported > 0 ? "bg-blue-400/5 border-blue-400/20" : "bg-white/5 border-white/10"}`}>
                  <div className="flex items-center gap-3 mb-2">
                    <Check className={`w-4 h-4 flex-shrink-0 ${syncResult.imported > 0 ? "text-blue-400" : "text-white/40"}`} />
                    <div>
                      <p className={`text-xs font-bold ${syncResult.imported > 0 ? "text-blue-400" : "text-white/60"}`}>
                        {syncResult.imported > 0
                          ? `${syncResult.imported} post${syncResult.imported !== 1 ? "s" : ""} importado${syncResult.imported !== 1 ? "s" : ""} com sucesso!`
                          : "Nenhum post novo — blog já está sincronizado"
                        }
                      </p>
                      <p className="text-white/40 text-xs mt-0.5">
                        {syncResult.total} encontrados no WP · {syncResult.skipped} ignorados (já existiam ou sem conteúdo)
                      </p>
                    </div>
                  </div>
                  {syncResult.posts.length > 0 && (
                    <div className="mt-2 max-h-32 overflow-y-auto space-y-1">
                      {syncResult.posts.map(p => (
                        <p key={p.slug} className="text-white/50 text-xs truncate pl-7">• {p.title}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Painel de Agendamento Automático */}
            <div className="bg-card border border-primary/20 rounded-3xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-black text-white">Publicação Automática Diária</h2>
                    <p className="text-white/40 text-xs mt-0.5">
                      O Soro AI publica um novo artigo todo dia às <span className="text-primary font-bold">08:00 BRT</span> automaticamente
                    </p>
                    {schedulerStatus && (
                      <p className="text-white/30 text-xs mt-1">
                        Próxima publicação: <span className="text-white/60">{new Date(schedulerStatus.nextRunBRT).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" })}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <div className="flex items-center gap-1.5 bg-green-400/10 text-green-400 text-xs font-bold rounded-full px-3 py-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Agendador ativo
                  </div>
                  <Button
                    onClick={handleRunNow}
                    disabled={runningAuto}
                    className="h-9 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-black border border-primary/30 font-bold text-xs flex items-center gap-2 px-4"
                  >
                    {runningAuto
                      ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" />Gerando...</>
                      : <><Play className="w-3.5 h-3.5" />Publicar agora (manual)</>
                    }
                  </Button>
                </div>
              </div>
              {autoError && <p className="text-red-400 text-xs bg-red-400/10 rounded-xl px-4 py-2 mt-4">{autoError}</p>}
              {autoResult && (
                <div className="mt-4 bg-green-400/5 border border-green-400/20 rounded-xl px-4 py-3 flex items-center gap-3">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <div>
                    <p className="text-green-400 text-xs font-bold">Post publicado com sucesso!</p>
                    <p className="text-white/60 text-xs mt-0.5 line-clamp-1">{autoResult.title}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
            {/* Painel de configuração */}
            <div className="bg-card border border-white/10 rounded-3xl p-6 flex flex-col gap-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-black text-white">Soro AI Content Writer</h2>
                  <p className="text-white/40 text-xs">Gera artigos SEO completos para o blog VaideVan</p>
                </div>
              </div>

              {/* Palavra-chave */}
              <div>
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">
                  Palavra-chave principal
                </label>
                <div className="relative">
                  <select
                    value={soroKeyword}
                    onChange={e => { setSoroKeyword(e.target.value); setSoroCustomKeyword(""); }}
                    className="w-full bg-background border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors text-sm appearance-none pr-10"
                  >
                    {SORO_KEYWORDS.map(kw => <option key={kw} value={kw}>{kw}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                </div>
                <p className="text-white/30 text-xs mt-1.5">Ou insira uma palavra-chave personalizada abaixo</p>
                <input
                  value={soroCustomKeyword}
                  onChange={e => setSoroCustomKeyword(e.target.value)}
                  placeholder="ex: van executiva Alphaville SP..."
                  className="w-full mt-2 bg-background border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-primary transition-colors text-sm"
                />
              </div>

              {/* Categoria */}
              <div>
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">Categoria</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(c => (
                    <button
                      key={c}
                      onClick={() => setSoroCategory(c)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                        soroCategory === c
                          ? "bg-primary text-black border-primary"
                          : "bg-transparent text-white/40 border-white/10 hover:border-primary/30 hover:text-white"
                      }`}
                    >{c}</button>
                  ))}
                </div>
              </div>

              {/* Título personalizado */}
              <div>
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider mb-2 block">
                  Título personalizado <span className="text-white/30 normal-case font-normal">(opcional)</span>
                </label>
                <input
                  value={soroCustomTitle}
                  onChange={e => setSoroCustomTitle(e.target.value)}
                  placeholder="Deixe vazio para o Soro gerar automaticamente"
                  className="w-full bg-background border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-primary transition-colors text-sm"
                />
              </div>

              {soroError && <p className="text-red-400 text-sm bg-red-400/10 rounded-xl px-4 py-3">{soroError}</p>}

              <Button
                onClick={handleSoroGenerate}
                disabled={soroGenerating}
                className="h-12 rounded-full bg-primary text-black font-black flex items-center justify-center gap-2"
              >
                {soroGenerating ? (
                  <><RefreshCw className="w-4 h-4 animate-spin" />Gerando artigo...</>
                ) : (
                  <><Sparkles className="w-4 h-4" />Gerar Post com Soro AI</>
                )}
              </Button>

              {soroGenerating && (
                <div className="text-center text-white/40 text-xs animate-pulse">
                  O Claude está escrevendo seu artigo SEO... (pode levar 30-60s)
                </div>
              )}
            </div>

            {/* Preview do artigo gerado */}
            <div className="bg-card border border-white/10 rounded-3xl overflow-hidden flex flex-col">
              {!soroResult ? (
                <div className="flex-1 flex flex-col items-center justify-center p-10 text-center text-white/20">
                  <Sparkles className="w-12 h-12 mb-4 opacity-30" />
                  <p className="font-bold text-white/30">O artigo gerado aparecerá aqui</p>
                  <p className="text-sm mt-1">Configure os parâmetros e clique em Gerar</p>
                </div>
              ) : (
                <>
                  <div className="p-5 border-b border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />Gerado pelo Soro AI
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setSoroPreviewMode("rendered")}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${soroPreviewMode === "rendered" ? "bg-primary/10 text-primary" : "text-white/30 hover:text-white"}`}
                        >Preview</button>
                        <button
                          onClick={() => setSoroPreviewMode("html")}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${soroPreviewMode === "html" ? "bg-primary/10 text-primary" : "text-white/30 hover:text-white"}`}
                        >HTML</button>
                      </div>
                    </div>
                    <h3 className="font-black text-white text-base leading-tight">{soroResult.title}</h3>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">{soroResult.category}</span>
                      <span className="text-xs text-white/30">KW: {soroResult.keyword}</span>
                    </div>

                    {/* SEO info */}
                    <div className="mt-3 bg-background rounded-xl p-3 space-y-1.5">
                      <div>
                        <span className="text-white/30 text-xs">SEO Title: </span>
                        <span className="text-white/70 text-xs">{soroResult.seoTitle}</span>
                      </div>
                      <div>
                        <span className="text-white/30 text-xs">Meta Desc: </span>
                        <span className="text-white/70 text-xs">{soroResult.seoDescription}</span>
                      </div>
                      <div>
                        <span className="text-white/30 text-xs">Imagem sugerida: </span>
                        <span className="text-white/70 text-xs">{soroResult.imageQuery}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5 max-h-80">
                    {soroPreviewMode === "rendered" ? (
                      <div
                        className="prose prose-invert prose-sm max-w-none text-white/80 prose-headings:text-white prose-strong:text-white"
                        dangerouslySetInnerHTML={{ __html: soroResult.content }}
                      />
                    ) : (
                      <pre className="text-xs text-green-400 whitespace-pre-wrap font-mono leading-relaxed">{soroResult.content}</pre>
                    )}
                  </div>

                  <div className="p-4 border-t border-white/10 flex gap-3 flex-wrap">
                    {soroPublished ? (
                      <div className="flex-1 flex items-center justify-center gap-2 h-11 bg-green-400/10 text-green-400 rounded-full font-black text-sm">
                        <Check className="w-4 h-4" />Post publicado! Redirecionando...
                      </div>
                    ) : (
                      <>
                        <Button
                          onClick={() => handleSoroPublish(false)}
                          disabled={soroPublishing}
                          className="flex-1 h-11 rounded-full bg-primary text-black font-black flex items-center justify-center gap-2 text-sm"
                        >
                          {soroPublishing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          {soroPublishing ? "Publicando..." : "Publicar agora"}
                        </Button>
                        <button
                          onClick={() => handleSoroPublish(true)}
                          disabled={soroPublishing}
                          className="px-4 h-11 rounded-full border border-white/20 text-white/50 hover:text-white hover:border-white/40 font-bold text-sm transition-all flex items-center gap-2"
                        >
                          <EyeOff className="w-3.5 h-3.5" />Rascunho
                        </button>
                        <button
                          onClick={useSoroInEditor}
                          className="px-4 h-11 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-white/40 font-bold text-sm transition-all flex items-center gap-2"
                        >
                          <Edit3 className="w-3.5 h-3.5" />Editar
                        </button>
                        <button
                          onClick={handleSoroGenerate}
                          disabled={soroGenerating}
                          title="Gerar novamente"
                          className="w-11 h-11 rounded-full border border-white/20 text-white/40 hover:text-white hover:border-white/40 flex items-center justify-center transition-all"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
            </div>
          </div>
        )}

        {/* ── TAB: WEBHOOK ──────────────────────────────────────────── */}
        {tab === "webhook" && (
          <div className="bg-card border border-white/10 rounded-3xl p-6 max-w-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-black text-white">Webhook de Automação</h2>
                <p className="text-white/40 text-xs">Integre com WordPress, Zapier ou qualquer ferramenta</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-background rounded-xl p-4">
                <p className="text-white/40 text-xs mb-1.5 font-bold uppercase tracking-wider">Endpoint</p>
                <div className="flex items-center gap-2">
                  <code className="text-primary text-sm break-all flex-1">{apiBaseUrl}/api/blog/webhook</code>
                  <button onClick={() => navigator.clipboard.writeText(`${apiBaseUrl}/api/blog/webhook`)}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-white/30 hover:text-white transition-colors">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="bg-background rounded-xl p-4">
                <p className="text-white/40 text-xs mb-1.5 font-bold uppercase tracking-wider">Método & Header</p>
                <p className="text-white/70 text-sm">POST · <code className="text-green-400">x-webhook-key: {webhookKey}</code></p>
              </div>
              <div className="bg-background rounded-xl p-4">
                <p className="text-white/40 text-xs mb-1.5 font-bold uppercase tracking-wider">Corpo JSON</p>
                <pre className="text-white/70 text-xs font-mono">{`{
  "title": "Título do post",
  "content": "<p>HTML do conteúdo</p>",
  "excerpt": "Resumo (opcional)",
  "image": "https://url-da-imagem",
  "category": "Transporte Executivo"
}`}</pre>
              </div>
              <a
                href={`${apiBaseUrl}/api/health`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-white/30 hover:text-primary transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />Testar conexão com a API
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Modal de criação/edição */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-card border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="font-black text-white text-xl">{editing ? "Editar Post" : "Nova Postagem"}</h2>
              <button onClick={() => setShowForm(false)} className="text-white/30 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-5">
              <div>
                <label className="text-xs font-bold text-white/60 mb-2 block uppercase tracking-wider">Título *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Título do artigo..."
                  className="w-full bg-background border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary transition-colors text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-white/60 mb-2 block uppercase tracking-wider">Categoria</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full bg-background border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors text-sm">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-white/60 mb-2 block uppercase tracking-wider">Resumo</label>
                <textarea value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                  placeholder="Breve descrição do artigo..." rows={2}
                  className="w-full bg-background border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary transition-colors text-sm resize-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-white/60 mb-2 block uppercase tracking-wider">URL da Imagem</label>
                <input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                  placeholder="https://..."
                  className="w-full bg-background border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary transition-colors text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-white/60 mb-2 block uppercase tracking-wider">Conteúdo (HTML) *</label>
                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="<h2>Título da seção</h2><p>Parágrafo...</p>" rows={12}
                  className="w-full bg-background border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary transition-colors text-sm font-mono resize-none" />
              </div>
              <div className="flex items-center gap-3 py-1">
                <button
                  onClick={() => setForm(f => ({ ...f, published: !f.published }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                    form.published
                      ? "bg-green-400/10 text-green-400 border-green-400/30"
                      : "bg-white/5 text-white/40 border-white/20"
                  }`}
                >
                  {form.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  {form.published ? "Publicado" : "Rascunho"}
                </button>
                <span className="text-white/20 text-xs">Clique para alternar</span>
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex gap-3">
                <Button onClick={() => handleSave()} disabled={saving}
                  className="flex-1 h-12 rounded-full bg-primary text-black font-black flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />
                  {saving ? "Salvando..." : editing ? "Salvar alterações" : form.published ? "Publicar post" : "Salvar rascunho"}
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}
                  className="h-12 rounded-full border-white/20 text-white hover:bg-white/10 px-6">
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
