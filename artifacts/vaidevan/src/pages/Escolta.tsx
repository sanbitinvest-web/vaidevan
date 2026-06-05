import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Shield, CheckCircle2, Phone, User, FileText, MapPin, Clock, Award, Send, Loader2, X, ChevronDown } from "lucide-react";
import { Link } from "wouter";

const WHATSAPP_BASE = "https://wa.me/5511999294694?text=";

const FORCAS = [
  "Polícia Civil",
  "Polícia Militar",
  "Polícia Federal",
  "Polícia Rodoviária Federal",
  "Guarda Civil Metropolitana",
  "Guarda Municipal",
  "Agente Penitenciário",
  "Segurança Privada (CGESF/SP400)",
  "Forças Armadas (Ativo/Reserva)",
  "Outra",
];

const CERTIFICACOES = [
  "Curso de Direção Defensiva",
  "Habilitação Veículo Blindado",
  "Gestão de Crise / Anti-sequestro",
  "Primeiros Socorros Táticos",
  "Tiro Defensivo Avançado",
  "Escolta de Autoridades (GTOP)",
  "Segurança de Dignitários (SD)",
  "Investigação / Contrainteligência",
];

type FormState = {
  nome: string;
  cpf: string;
  forca: string;
  orgao: string;
  matricula: string;
  graduacao: string;
  estado: string;
  cidade: string;
  whatsapp: string;
  disponibilidade: string;
  experiencia: string;
  certificacoes: string[];
  observacoes: string;
};

const EMPTY: FormState = {
  nome: "", cpf: "", forca: "", orgao: "", matricula: "",
  graduacao: "", estado: "", cidade: "", whatsapp: "",
  disponibilidade: "", experiencia: "", certificacoes: [], observacoes: "",
};

const ESTADOS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

export default function Escolta() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState("");

  const f = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const toggleCert = (cert: string) => {
    setForm(p => ({
      ...p,
      certificacoes: p.certificacoes.includes(cert)
        ? p.certificacoes.filter(c => c !== cert)
        : [...p.certificacoes, cert],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome || !form.cpf || !form.forca || !form.orgao || !form.matricula || !form.whatsapp) {
      setError("Preencha todos os campos obrigatórios (*)."); return;
    }
    setStatus("loading"); setError("");
    try {
      const _extApi = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? `${import.meta.env.BASE_URL.replace(/\/$/, "")}/api`;
      await fetch(`${_extApi}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome,
          telefone: form.whatsapp,
          tipo: "agente_escolta",
          mensagem: [
            `Força: ${form.forca}`,
            `Órgão: ${form.orgao}`,
            `Matrícula: ${form.matricula}`,
            `Graduação/Cargo: ${form.graduacao}`,
            `CPF: ${form.cpf}`,
            `Localização: ${form.cidade} — ${form.estado}`,
            `Disponibilidade: ${form.disponibilidade}`,
            `Experiência: ${form.experiencia} anos`,
            `Certificações: ${form.certificacoes.join(", ") || "Nenhuma informada"}`,
            form.observacoes ? `Obs: ${form.observacoes}` : "",
          ].filter(Boolean).join(" | "),
        }),
      });
    } catch {
      // Fallback WhatsApp
      const msg = [
        `🛡️ CADASTRO DE AGENTE DE ESCOLTA — VaideVan`,
        `Nome: ${form.nome}`,
        `Força/Corporação: ${form.forca}`,
        `Órgão: ${form.orgao}`,
        `Matrícula: ${form.matricula}`,
        `Graduação: ${form.graduacao || "—"}`,
        `CPF: ${form.cpf}`,
        `WhatsApp: ${form.whatsapp}`,
        `Localização: ${form.cidade} — ${form.estado}`,
        `Disponibilidade: ${form.disponibilidade || "—"}`,
        `Experiência: ${form.experiencia || "—"} anos`,
        `Certificações: ${form.certificacoes.join(", ") || "Nenhuma informada"}`,
        form.observacoes ? `Observações: ${form.observacoes}` : "",
      ].filter(Boolean).join("\n");
      window.open(WHATSAPP_BASE + encodeURIComponent(msg), "_blank");
    }
    setStatus("success");
  };

  const inp = "w-full bg-[#0D0D0D] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:border-primary/50 transition-colors";
  const label = "text-white/50 text-xs font-bold uppercase tracking-wider mb-1.5 block";

  return (
    <>
      <Helmet>
        <title>Cadastro de Agente de Escolta — Polícia e Segurança | VaideVan</title>
        <meta name="description" content="VaideVan seleciona Agentes de Escolta — Polícia Civil, Militar, Federal e Segurança Privada treinados para acompanhamento de veículos executivos. Cadastre-se e junte-se à equipe." />
        <link rel="canonical" href="https://vaidevan.com/escolta" />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        {/* Nav mínimo */}
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background/90 backdrop-blur-xl border-b border-white/5">
          <Link href="/">
            <img src="/logo-black-sm.webp" alt="VaideVan" width={44} height={44} style={{ filter: "brightness(2) saturate(1.5)" }} />
          </Link>
          <Link href="/">
            <button className="text-white/50 hover:text-white text-sm font-semibold transition-colors flex items-center gap-1.5">
              <X className="w-4 h-4" /> Voltar ao site
            </button>
          </Link>
        </nav>

        {/* HERO */}
        <section className="pt-32 pb-20 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(245,230,66,0.06),transparent)]" />
          <div className="container mx-auto max-w-3xl text-center relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 mb-6 mx-auto">
              <Shield className="w-10 h-10 text-primary" />
            </div>
            <span className="text-primary text-xs font-black tracking-widest uppercase mb-4 block">VaideVan Escolta — Programa de Agentes</span>
            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
              Cadastro de<br />
              <span className="text-primary">Agentes de Escolta</span>
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              A VaideVan credencia Agentes de Escolta — Policiais Civis, Militares, Federais, Rodoviários Federais e Segurança Privada — para acompanhamento de veículos executivos de alto padrão em São Paulo e todo o Brasil.
            </p>

            <div className="grid md:grid-cols-3 gap-4 text-left mb-12">
              {[
                { icon: Award,  title: "Remuneração diferenciada",  desc: "Comissão por escolta realizada com garantia de pagamento no prazo." },
                { icon: Clock,  title: "Plantão sob demanda",       desc: "Você define sua disponibilidade e recebe convocações pelo WhatsApp." },
                { icon: Shield, title: "Operações regulamentadas",  desc: "Todas as escoltas seguem a Lei 7.102/83 e regulamentações estaduais." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-card border border-white/10 rounded-2xl p-5">
                  <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                    <Icon className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <p className="font-black text-white text-sm mb-1">{title}</p>
                  <p className="text-white/45 text-xs leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FORMULÁRIO */}
        <section className="py-10 px-4 pb-24">
          <div className="container mx-auto max-w-2xl">
            <div className="bg-card border border-white/10 rounded-3xl overflow-hidden">
              <div className="bg-primary/5 border-b border-white/10 px-8 py-6 flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="font-black text-white">Formulário de Credenciamento</h2>
                  <p className="text-white/40 text-xs mt-0.5">Todos os dados são tratados com sigilo absoluto</p>
                </div>
              </div>

              {status === "success" ? (
                <div className="p-10 text-center">
                  <div className="w-16 h-16 bg-green-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-black text-white mb-2">Cadastro enviado!</h3>
                  <p className="text-white/50 text-sm max-w-sm mx-auto mb-6">
                    Nossa equipe de operações analisará seu perfil e entrará em contato pelo WhatsApp em até 48h úteis.
                  </p>
                  <a href={WHATSAPP_BASE + encodeURIComponent("Olá! Acabei de preencher o formulário de credenciamento como Agente de Escolta VaideVan. Podem confirmar o recebimento?")} target="_blank" rel="noopener noreferrer">
                    <button className="inline-flex items-center gap-2 bg-[#25D366] text-white font-black rounded-full px-6 py-3 hover:bg-[#1da851] transition text-sm">
                      <Phone className="w-4 h-4" /> Confirmar pelo WhatsApp
                    </button>
                  </a>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                  {error && (
                    <div className="bg-red-400/10 border border-red-400/20 text-red-400 rounded-xl px-4 py-3 text-sm">{error}</div>
                  )}

                  {/* Identificação */}
                  <div>
                    <p className="text-primary text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-2">
                      <User className="w-3.5 h-3.5" /> Identificação Pessoal
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className={label}>Nome Completo *</label>
                        <input className={inp} value={form.nome} onChange={f("nome")} placeholder="Nome completo conforme documento" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={label}>CPF *</label>
                          <input className={inp} value={form.cpf} onChange={f("cpf")} placeholder="000.000.000-00" required />
                        </div>
                        <div>
                          <label className={label}>WhatsApp *</label>
                          <input className={inp} value={form.whatsapp} onChange={f("whatsapp")} placeholder="(11) 99999-0000" required />
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr className="border-white/8" />

                  {/* Força / Corporação */}
                  <div>
                    <p className="text-primary text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5" /> Corporação / Força
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className={label}>Força / Corporação *</label>
                        <div className="relative">
                          <select className={`${inp} appearance-none pr-10`} value={form.forca} onChange={f("forca")} required>
                            <option value="">Selecione a força/corporação</option>
                            {FORCAS.map(f => <option key={f} value={f}>{f}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={label}>Órgão / Instituição *</label>
                          <input className={inp} value={form.orgao} onChange={f("orgao")} placeholder="Ex: PMESP, PCSP, DPF..." required />
                        </div>
                        <div>
                          <label className={label}>Matrícula / Registro *</label>
                          <input className={inp} value={form.matricula} onChange={f("matricula")} placeholder="Número funcional" required />
                        </div>
                      </div>
                      <div>
                        <label className={label}>Graduação / Cargo</label>
                        <input className={inp} value={form.graduacao} onChange={f("graduacao")} placeholder="Ex: Sargento, Inspetor, Delegado, Investigador..." />
                      </div>
                    </div>
                  </div>

                  <hr className="border-white/8" />

                  {/* Localização */}
                  <div>
                    <p className="text-primary text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5" /> Localização
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <label className={label}>Cidade</label>
                        <input className={inp} value={form.cidade} onChange={f("cidade")} placeholder="São Paulo" />
                      </div>
                      <div>
                        <label className={label}>Estado (UF)</label>
                        <div className="relative">
                          <select className={`${inp} appearance-none pr-10`} value={form.estado} onChange={f("estado")}>
                            <option value="">UF</option>
                            {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <hr className="border-white/8" />

                  {/* Disponibilidade e Experiência */}
                  <div>
                    <p className="text-primary text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" /> Disponibilidade e Experiência
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className={label}>Disponibilidade (dias e horários)</label>
                        <input className={inp} value={form.disponibilidade} onChange={f("disponibilidade")} placeholder="Ex: Seg–Sex após 18h, fins de semana integral" />
                      </div>
                      <div>
                        <label className={label}>Anos de Experiência em Escolta</label>
                        <input className={inp} type="number" min="0" max="50" value={form.experiencia} onChange={f("experiencia")} placeholder="0" />
                      </div>
                    </div>
                  </div>

                  <hr className="border-white/8" />

                  {/* Certificações */}
                  <div>
                    <p className="text-primary text-xs font-black uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Award className="w-3.5 h-3.5" /> Certificações (selecione as que possuir)
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {CERTIFICACOES.map(cert => (
                        <button
                          key={cert}
                          type="button"
                          onClick={() => toggleCert(cert)}
                          className={`text-left text-xs font-semibold px-3 py-2.5 rounded-xl border transition-all flex items-center gap-2 ${
                            form.certificacoes.includes(cert)
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-white/10 text-white/50 hover:border-white/20"
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded border flex-shrink-0 flex items-center justify-center ${form.certificacoes.includes(cert) ? "border-primary bg-primary" : "border-white/20"}`}>
                            {form.certificacoes.includes(cert) && <span className="text-black text-[8px] font-black">✓</span>}
                          </span>
                          {cert}
                        </button>
                      ))}
                    </div>
                  </div>

                  <hr className="border-white/8" />

                  {/* Observações */}
                  <div>
                    <label className={label}>Observações / Experiências Relevantes</label>
                    <textarea
                      className={`${inp} resize-none`}
                      rows={3}
                      value={form.observacoes}
                      onChange={f("observacoes")}
                      placeholder="Missões ou experiências relevantes, armamentos habilitados, veículos que conduz, etc."
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="w-full h-14 rounded-full bg-primary text-black font-black text-base hover:bg-primary/90 transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(245,230,66,0.2)]"
                    >
                      {status === "loading"
                        ? <><Loader2 className="w-5 h-5 animate-spin" /> Enviando credenciamento...</>
                        : <><Send className="w-5 h-5" /> Enviar Cadastro de Credenciamento</>}
                    </button>
                    <p className="text-white/30 text-xs text-center mt-3 flex items-center justify-center gap-1.5">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                      </span>
                      Dados tratados com sigilo total · Resposta em até 48h úteis
                    </p>
                  </div>
                </form>
              )}
            </div>

            {/* Aviso legal */}
            <div className="mt-6 p-5 rounded-2xl bg-yellow-400/5 border border-yellow-400/15 text-yellow-400/70 text-xs leading-relaxed">
              <strong className="text-yellow-400">Aviso legal:</strong> O credenciamento de agentes de escolta pela VaideVan segue estritamente a Lei 7.102/83 e suas regulamentações (Portaria DG/DPF), além das legislações estaduais pertinentes. Agentes de segurança privada devem possuir registro ativo no SINDESP/SSP. Policiais ativos devem observar as normas disciplinares do seu órgão para atividades complementares. Todas as informações fornecidas são verificadas antes do credenciamento.
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
