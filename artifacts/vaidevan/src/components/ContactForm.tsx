import { useState } from "react";
import { Phone, Send, CheckCircle2, Loader2 } from "lucide-react";

const WHATSAPP_LINK = "https://wa.me/5511999294694?text=";
const EXTERNAL_API = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "");
const API_BASE = EXTERNAL_API ?? `${import.meta.env.BASE_URL.replace(/\/$/, "")}/api`;

interface ContactFormProps {
  defaultTipo?: string;
  onSuccess?: () => void;
}

export function ContactForm({ defaultTipo, onSuccess }: ContactFormProps = {}) {
  const [form, setForm] = useState({ nome: "", telefone: "", mensagem: "", tipo: defaultTipo || "Fretamento corporativo" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const tipos = [
    "Fretamento corporativo",
    "Transfer aeroporto",
    "Van para eventos",
    "Excursão / passeio",
    "Transporte executivo VIP",
    "Outro",
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch(`${API_BASE}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("success");
        onSuccess?.();
      } else {
        throw new Error("Falha no envio");
      }
    } catch {
      // Fallback: abre WhatsApp com os dados preenchidos
      const msg = `Olá! Me chamo ${form.nome}. ${form.mensagem} (Serviço: ${form.tipo}. Telefone: ${form.telefone})`;
      window.open(WHATSAPP_LINK + encodeURIComponent(msg), "_blank");
      setStatus("success");
      onSuccess?.();
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-2xl font-black mb-2">Mensagem enviada!</h3>
        <p className="text-white/60 max-w-sm">Mensagem recebida! Nossa equipe está de prontidão e entrará em contato imediatamente. Prefere falar agora? Chame no WhatsApp.</p>
        <a
          href={WHATSAPP_LINK + encodeURIComponent("Olá! Acabei de preencher o formulário no site da VaideVan e gostaria de confirmar meu pedido de orçamento. Podem me atender agora?")}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 bg-primary text-black font-black rounded-full px-6 py-3 hover:bg-primary/90 transition-all"
        >
          <Phone className="w-4 h-4" /> Falar no WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold mb-1.5 text-white/70">Seu nome *</label>
          <input
            type="text"
            required
            value={form.nome}
            onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
            placeholder="João Silva"
            className="w-full rounded-xl bg-card border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors placeholder-white/30"
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1.5 text-white/70">WhatsApp / Telefone *</label>
          <input
            type="tel"
            required
            value={form.telefone}
            onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))}
            placeholder="(11) 99999-0000"
            className="w-full rounded-xl bg-card border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors placeholder-white/30"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold mb-1.5 text-white/70">Tipo de serviço</label>
        <select
          value={form.tipo}
          onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
          className="w-full rounded-xl bg-card border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors text-white/80"
        >
          {tipos.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold mb-1.5 text-white/70">Mensagem *</label>
        <textarea
          required
          rows={4}
          value={form.mensagem}
          onChange={e => setForm(f => ({ ...f, mensagem: e.target.value }))}
          placeholder="Descreva sua necessidade: rota, datas, número de passageiros..."
          className="w-full rounded-xl bg-card border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors placeholder-white/30 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full flex items-center justify-center gap-2 bg-primary text-black font-black rounded-full py-4 hover:bg-primary/90 transition-all disabled:opacity-60"
      >
        {status === "loading" ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
        ) : (
          <><Send className="w-4 h-4" /> Solicitar Orçamento Gratuito</>
        )}
      </button>
      <p className="text-white/40 text-xs text-center flex items-center justify-center gap-1.5">
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
        </span>
        Equipe online agora • Resposta imediata • Orçamento gratuito
      </p>
    </form>
  );
}
