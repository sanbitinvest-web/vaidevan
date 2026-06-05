import { useState, useRef, useEffect } from "react";
import { MessageSquarePlus, X, Send, CheckCircle2, ChevronDown } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

const CATEGORIAS = [
  { value: "sugestao", label: "💡 Sugestão" },
  { value: "ideia", label: "✨ Ideia" },
  { value: "critica", label: "🎯 Crítica" },
  { value: "duvida", label: "❓ Dúvida" },
  { value: "curiosidade", label: "🔍 Curiosidade" },
  { value: "elogio", label: "⭐ Elogio" },
];

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [categoria, setCategoria] = useState("sugestao");
  const [mensagem, setMensagem] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [open]);

  function resetForm() {
    setMensagem("");
    setNome("");
    setEmail("");
    setCategoria("sugestao");
    setError("");
    setSent(false);
  }

  function handleClose() {
    setOpen(false);
    setTimeout(resetForm, 300);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!mensagem.trim()) {
      setError("Por favor, escreva sua mensagem.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const catLabel = CATEGORIAS.find((c) => c.value === categoria)?.label.replace(/[^\w\s]/g, "").trim() || categoria;
      const res = await fetch(`${API_BASE}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensagem: mensagem.trim(),
          nome: nome.trim() || "Anônimo",
          email: email.trim() || undefined,
          tipo: catLabel,
          origem: "site-feedback-widget",
        }),
      });
      if (!res.ok) throw new Error("Erro ao enviar");
      setSent(true);
      setTimeout(handleClose, 2800);
    } catch {
      setError("Não foi possível enviar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50 flex items-center gap-2 px-3 py-2.5 sm:px-4 sm:py-3 bg-[#1a1a1a] border border-white/10 text-white rounded-full shadow-lg hover:border-primary/40 hover:bg-[#222] transition-all duration-200 group"
        aria-label="Enviar feedback ou sugestão"
      >
        <MessageSquarePlus className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
        <span className="text-xs font-semibold hidden sm:inline text-white/70 group-hover:text-white transition-colors">
          Sugestão
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[9998] flex items-end sm:items-end justify-start pointer-events-none">
          <div
            className="absolute inset-0 bg-black/40 pointer-events-auto"
            onClick={handleClose}
          />
          <div className="relative pointer-events-auto w-full sm:w-[380px] m-4 sm:ml-6 sm:mb-6">
            <div className="rounded-2xl border border-white/10 bg-[#111] shadow-2xl shadow-black/60 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
                <div className="flex items-center gap-2">
                  <MessageSquarePlus className="w-4 h-4 text-primary" />
                  <span className="font-black text-white text-sm">Fale com a VaideVan</span>
                </div>
                <button
                  onClick={handleClose}
                  className="text-white/30 hover:text-white/70 transition-colors p-0.5"
                  aria-label="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {sent ? (
                <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
                  <CheckCircle2 className="w-10 h-10 text-green-400 mb-3" />
                  <p className="font-black text-white text-base mb-1">Obrigado!</p>
                  <p className="text-white/50 text-sm">Sua mensagem foi enviada com sucesso.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                  <div>
                    <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">
                      Categoria
                    </label>
                    <div className="relative">
                      <select
                        value={categoria}
                        onChange={(e) => setCategoria(e.target.value)}
                        className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm appearance-none focus:outline-none focus:border-primary/40 transition-colors pr-8"
                      >
                        {CATEGORIAS.map((c) => (
                          <option key={c.value} value={c.value} className="bg-[#1a1a1a]">
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
                    </div>
                  </div>

                  <div>
                    <label className="text-white/40 text-xs uppercase tracking-wider mb-2 block">
                      Mensagem <span className="text-primary">*</span>
                    </label>
                    <textarea
                      ref={textareaRef}
                      value={mensagem}
                      onChange={(e) => { setMensagem(e.target.value); setError(""); }}
                      placeholder="Escreva sua sugestão, ideia, crítica, curiosidade ou dúvida..."
                      rows={4}
                      className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-4 py-3 text-white text-sm resize-none focus:outline-none focus:border-primary/40 transition-colors placeholder:text-white/25"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">
                        Nome (opcional)
                      </label>
                      <input
                        type="text"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Seu nome"
                        className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/40 transition-colors placeholder:text-white/25"
                      />
                    </div>
                    <div>
                      <label className="text-white/40 text-xs uppercase tracking-wider mb-1.5 block">
                        E-mail (opcional)
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Para retorno"
                        className="w-full bg-white/[0.05] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/40 transition-colors placeholder:text-white/25"
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="text-red-400 text-xs">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !mensagem.trim()}
                    className="w-full bg-primary text-black font-black text-sm py-3 rounded-xl hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Enviar mensagem
                      </>
                    )}
                  </button>

                  <p className="text-white/25 text-xs text-center leading-relaxed">
                    Canal alternativo para clientes · Responderemos por e-mail se informado
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
