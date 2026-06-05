import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { api, ApiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Users, Plus, Search, Pencil, Trash2, ShieldCheck, Shield,
  Building2, User, ChevronDown, X, CheckCircle2,
} from "lucide-react";

type ClientForm = {
  type: string; name: string; email: string; phone: string; cpf: string; rg: string;
  cnpj: string; companyName: string; cep: string; street: string; number: string;
  complement: string; neighborhood: string; city: string; state: string; notes: string;
};

const EMPTY: ClientForm = {
  type: "pessoa_fisica", name: "", email: "", phone: "", cpf: "", rg: "",
  cnpj: "", companyName: "", cep: "", street: "", number: "",
  complement: "", neighborhood: "", city: "", state: "", notes: "",
};

function Badge({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="flex items-center gap-1 text-xs font-bold text-green-400 bg-green-400/10 rounded-full px-2 py-0.5">
      <ShieldCheck className="w-3 h-3" />Gov.br
    </span>
  ) : (
    <span className="flex items-center gap-1 text-xs font-bold text-white/30 bg-white/5 rounded-full px-2 py-0.5">
      <Shield className="w-3 h-3" />Pendente
    </span>
  );
}

function Modal({ client, onClose, onSave }: {
  client: ApiClient | null; onClose: () => void;
  onSave: (data: ClientForm, id?: number) => Promise<void>;
}) {
  const [form, setForm] = useState<ClientForm>(
    client ? { ...EMPTY, ...client, type: client.type, phone: client.phone || "", cpf: client.cpf || "", rg: client.rg || "", cnpj: client.cnpj || "", companyName: client.companyName || "", cep: client.cep || "", street: client.street || "", number: client.number || "", complement: client.complement || "", neighborhood: client.neighborhood || "", city: client.city || "", state: client.state || "", notes: client.notes || "" } : EMPTY
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const f = (k: keyof ClientForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) { setError("Nome e e-mail são obrigatórios"); return; }
    setSaving(true); setError("");
    try { await onSave(form, client?.id); onClose(); }
    catch (err) { setError(err instanceof Error ? err.message : "Erro ao salvar"); }
    finally { setSaving(false); }
  };

  const inp = "w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-primary/50 transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-card border border-white/10 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-white/10 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <h2 className="font-black text-white text-lg">{client ? "Editar Cliente" : "Novo Cliente"}</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-5">
          {error && <p className="text-red-400 text-sm bg-red-400/10 rounded-xl px-4 py-2">{error}</p>}

          <div>
            <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-2 block">Tipo de Pessoa</label>
            <div className="flex gap-3">
              {["pessoa_fisica", "pessoa_juridica"].map(t => (
                <button key={t} type="button" onClick={() => setForm(p => ({ ...p, type: t }))}
                  className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-xl border text-sm font-bold transition-all ${form.type === t ? "border-primary bg-primary/10 text-primary" : "border-white/10 text-white/50 hover:border-white/20"}`}>
                  {t === "pessoa_fisica" ? <User className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                  {t === "pessoa_fisica" ? "Pessoa Física" : "Pessoa Jurídica"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1 block">Nome Completo *</label>
              <input className={inp} value={form.name} onChange={f("name")} placeholder="Nome completo ou razão social" required />
            </div>
            <div>
              <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1 block">E-mail *</label>
              <input className={inp} type="email" value={form.email} onChange={f("email")} placeholder="email@exemplo.com" required />
            </div>
            <div>
              <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1 block">Telefone / WhatsApp</label>
              <input className={inp} value={form.phone} onChange={f("phone")} placeholder="(11) 99999-9999" />
            </div>
            {form.type === "pessoa_fisica" ? (
              <>
                <div>
                  <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1 block">CPF</label>
                  <input className={inp} value={form.cpf} onChange={f("cpf")} placeholder="000.000.000-00" />
                </div>
                <div>
                  <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1 block">RG</label>
                  <input className={inp} value={form.rg} onChange={f("rg")} placeholder="00.000.000-0" />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1 block">CNPJ</label>
                  <input className={inp} value={form.cnpj} onChange={f("cnpj")} placeholder="00.000.000/0001-00" />
                </div>
                <div>
                  <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1 block">Nome Fantasia</label>
                  <input className={inp} value={form.companyName} onChange={f("companyName")} placeholder="Nome fantasia" />
                </div>
              </>
            )}
          </div>

          <div>
            <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-3">Endereço</p>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="text-white/40 text-xs mb-1 block">CEP</label>
                <input className={inp} value={form.cep} onChange={f("cep")} placeholder="00000-000" />
              </div>
              <div className="md:col-span-1" />
              <div className="md:col-span-2">
                <label className="text-white/40 text-xs mb-1 block">Logradouro</label>
                <input className={inp} value={form.street} onChange={f("street")} placeholder="Rua, Avenida..." />
              </div>
              <div>
                <label className="text-white/40 text-xs mb-1 block">Número</label>
                <input className={inp} value={form.number} onChange={f("number")} placeholder="Nº" />
              </div>
              <div>
                <label className="text-white/40 text-xs mb-1 block">Complemento</label>
                <input className={inp} value={form.complement} onChange={f("complement")} placeholder="Apto, Sala..." />
              </div>
              <div>
                <label className="text-white/40 text-xs mb-1 block">Bairro</label>
                <input className={inp} value={form.neighborhood} onChange={f("neighborhood")} placeholder="Bairro" />
              </div>
              <div>
                <label className="text-white/40 text-xs mb-1 block">Cidade</label>
                <input className={inp} value={form.city} onChange={f("city")} placeholder="Cidade" />
              </div>
              <div>
                <label className="text-white/40 text-xs mb-1 block">Estado (UF)</label>
                <input className={inp} value={form.state} onChange={f("state")} placeholder="SP" maxLength={2} />
              </div>
            </div>
          </div>

          <div>
            <label className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1 block">Observações</label>
            <textarea className={`${inp} resize-none`} rows={2} value={form.notes} onChange={f("notes")} placeholder="Anotações internas..." />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-11 rounded-full border-white/20 text-white/70">
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="flex-1 h-11 font-black rounded-full bg-primary text-black hover:bg-primary/90">
              {saving ? "Salvando..." : client ? "Salvar Alterações" : "Cadastrar Cliente"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Clientes() {
  const [clients, setClients] = useState<ApiClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalClient, setModalClient] = useState<ApiClient | null | "new">(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [verifying, setVerifying] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  const load = () => {
    setLoading(true);
    api.clients().then(setClients).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(load, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const handleSave = async (data: ClientForm, id?: number) => {
    if (id) {
      const updated = await api.updateClient(id, data);
      setClients(p => p.map(c => c.id === id ? updated : c));
      showToast("Cliente atualizado com sucesso");
    } else {
      const created = await api.createClient(data);
      setClients(p => [created, ...p]);
      showToast("Cliente cadastrado com sucesso");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Excluir este cliente? Esta ação não pode ser desfeita.")) return;
    setDeleting(id);
    try {
      await api.deleteClient(id);
      setClients(p => p.filter(c => c.id !== id));
      showToast("Cliente excluído");
    } finally { setDeleting(null); }
  };

  const handleGovBr = async (id: number) => {
    setVerifying(id);
    try {
      const updated = await api.verifyClientGovBr(id);
      setClients(p => p.map(c => c.id === id ? updated : c));
      showToast("Gov.br vinculado com sucesso");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao vincular Gov.br");
    } finally { setVerifying(null); }
  };

  const filtered = clients.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.cpf || "").includes(search) || (c.cnpj || "").includes(search)
  );

  return (
    <DashboardLayout>
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-primary text-black font-bold px-5 py-3 rounded-2xl shadow-xl animate-in slide-in-from-top">
          <CheckCircle2 className="w-4 h-4 inline mr-2" />{toast}
        </div>
      )}

      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-white">Clientes</h1>
            <p className="text-white/50 mt-1">Gerencie o cadastro de clientes e vincule ao Gov.br</p>
          </div>
          <Button onClick={() => setModalClient("new")} className="h-11 px-5 font-black rounded-full bg-primary text-black hover:bg-primary/90 flex-shrink-0">
            <Plus className="w-4 h-4 mr-2" />Novo Cliente
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total", val: clients.length, color: "text-white" },
            { label: "Verificados Gov.br", val: clients.filter(c => c.govBrVerified).length, color: "text-green-400" },
            { label: "Empresas", val: clients.filter(c => c.type === "pessoa_juridica").length, color: "text-primary" },
          ].map(s => (
            <div key={s.label} className="bg-card border border-white/10 rounded-2xl p-5">
              <p className="text-white/50 text-sm">{s.label}</p>
              <p className={`text-3xl font-black ${s.color}`}>{s.val}</p>
            </div>
          ))}
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            className="w-full bg-card border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder-white/30 focus:outline-none focus:border-primary/50 transition-colors"
            placeholder="Buscar por nome, e-mail, CPF ou CNPJ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          [...Array(3)].map((_, i) => <div key={i} className="h-20 bg-card rounded-2xl mb-3 animate-pulse" />)
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-bold">{search ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}</p>
            {!search && <p className="text-sm mt-1">Clique em "Novo Cliente" para começar</p>}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map(c => (
              <div key={c.id} className="bg-card border border-white/10 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.type === "pessoa_juridica" ? "bg-primary/10" : "bg-white/5"}`}>
                    {c.type === "pessoa_juridica" ? <Building2 className="w-5 h-5 text-primary" /> : <User className="w-5 h-5 text-white/50" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-black text-white truncate">{c.name}</p>
                      <Badge ok={c.govBrVerified} />
                    </div>
                    <p className="text-white/40 text-sm truncate">{c.email}</p>
                    {(c.cpf || c.cnpj) && (
                      <p className="text-white/30 text-xs">{c.cpf ? `CPF: ${c.cpf}` : `CNPJ: ${c.cnpj}`}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!c.govBrVerified && (
                    <Button
                      onClick={() => handleGovBr(c.id)}
                      disabled={verifying === c.id || !c.cpf}
                      title={!c.cpf ? "CPF necessário para vincular Gov.br" : "Vincular Gov.br"}
                      className="h-8 px-3 text-xs font-bold rounded-full bg-[#1351B4] hover:bg-[#0d3d87] text-white flex-shrink-0"
                    >
                      {verifying === c.id ? "..." : "Gov.br"}
                    </Button>
                  )}
                  <Button onClick={() => setModalClient(c)} variant="outline" size="sm" className="h-8 w-8 p-0 rounded-xl border-white/10 hover:border-primary/40">
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button onClick={() => handleDelete(c.id)} disabled={deleting === c.id} variant="outline" size="sm" className="h-8 w-8 p-0 rounded-xl border-red-400/20 hover:border-red-400/50 text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalClient !== null && (
        <Modal
          client={modalClient === "new" ? null : modalClient}
          onClose={() => setModalClient(null)}
          onSave={handleSave}
        />
      )}
    </DashboardLayout>
  );
}
