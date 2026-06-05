import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { api, ApiInvestorProfile } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Shield, User, CheckCircle2, Save, Fingerprint } from "lucide-react";
import BiometricEnroll from "@/components/BiometricEnroll";

const inp = "w-full bg-background border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/30 focus:outline-none focus:border-primary/50 transition-colors";

export default function Perfil() {
  const [profile, setProfile] = useState<ApiInvestorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", phone: "", cpf: "", rg: "", nationality: "Brasileira",
    cep: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "",
  });

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  useEffect(() => {
    api.profile()
      .then(p => {
        setProfile(p);
        setForm({
          name: p.name || "", phone: p.phone || "", cpf: p.cpf || "",
          rg: p.rg || "", nationality: p.nationality || "Brasileira",
          cep: p.cep || "", street: p.street || "", number: p.number || "",
          complement: p.complement || "", neighborhood: p.neighborhood || "",
          city: p.city || "", state: p.state || "",
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const f = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const updated = await api.updateProfile(form);
      setProfile(updated);
      showToast("Perfil atualizado com sucesso");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleGovBr = async () => {
    if (!profile?.cpf && !form.cpf) {
      setError("Preencha e salve seu CPF antes de vincular ao Gov.br");
      return;
    }
    setVerifying(true); setError("");
    try {
      const updated = await api.verifyGovBr();
      setProfile(updated);
      showToast("Gov.br vinculado com sucesso");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao vincular Gov.br");
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 max-w-2xl mx-auto">
          {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-card rounded-xl mb-3 animate-pulse" />)}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-primary text-black font-bold px-5 py-3 rounded-2xl shadow-xl">
          <CheckCircle2 className="w-4 h-4 inline mr-2" />{toast}
        </div>
      )}

      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl lg:text-3xl font-black text-white mb-2">Meu Perfil</h1>
        <p className="text-white/50 mb-8">Mantenha seus dados atualizados para assinar contratos com Gov.br</p>

        {/* Gov.br status */}
        <div className={`rounded-2xl p-5 mb-8 border flex items-center gap-4 ${
          profile?.govBrVerified
            ? "bg-green-400/5 border-green-400/20"
            : "bg-[#1351B4]/10 border-[#1351B4]/30"
        }`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
            profile?.govBrVerified ? "bg-green-400/10" : "bg-[#1351B4]/20"
          }`}>
            {profile?.govBrVerified
              ? <ShieldCheck className="w-6 h-6 text-green-400" />
              : <Shield className="w-6 h-6 text-[#5c85d4]" />}
          </div>
          <div className="flex-1 min-w-0">
            {profile?.govBrVerified ? (
              <>
                <p className="font-black text-green-400">Gov.br Vinculado</p>
                <p className="text-white/40 text-sm">CPF {profile.govBrId} — Verificado em {profile.govBrVerifiedAt ? new Date(profile.govBrVerifiedAt).toLocaleDateString("pt-BR") : ""}</p>
                <p className="text-white/30 text-xs mt-0.5">Você pode assinar contratos com validade jurídica via plataforma Gov.br</p>
              </>
            ) : (
              <>
                <p className="font-black text-white">Vincule sua conta Gov.br</p>
                <p className="text-white/40 text-sm">Necessário para assinar contratos com validade jurídica (Lei 14.063/2020)</p>
              </>
            )}
          </div>
          {!profile?.govBrVerified && (
            <Button
              onClick={handleGovBr}
              disabled={verifying}
              className="h-10 px-4 font-bold rounded-full bg-[#1351B4] hover:bg-[#0d3d87] text-white text-sm flex-shrink-0"
            >
              {verifying ? "Verificando..." : "Vincular Gov.br"}
            </Button>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {error && <p className="text-red-400 text-sm bg-red-400/10 rounded-xl px-4 py-2">{error}</p>}

          <div>
            <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="w-3.5 h-3.5" />Dados Pessoais
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-white/40 text-xs mb-1 block">Nome Completo *</label>
                <input className={inp} value={form.name} onChange={f("name")} placeholder="Seu nome completo" required />
              </div>
              <div>
                <label className="text-white/40 text-xs mb-1 block">Telefone / WhatsApp</label>
                <input className={inp} value={form.phone} onChange={f("phone")} placeholder="(11) 99999-9999" />
              </div>
              <div>
                <label className="text-white/40 text-xs mb-1 block">Nacionalidade</label>
                <input className={inp} value={form.nationality} onChange={f("nationality")} placeholder="Brasileira" />
              </div>
              <div>
                <label className="text-white/40 text-xs mb-1 block">CPF {!profile?.govBrVerified && <span className="text-primary">*</span>}</label>
                <input className={inp} value={form.cpf} onChange={f("cpf")} placeholder="000.000.000-00" />
                {!profile?.govBrVerified && <p className="text-white/30 text-xs mt-1">Necessário para vincular Gov.br</p>}
              </div>
              <div>
                <label className="text-white/40 text-xs mb-1 block">RG</label>
                <input className={inp} value={form.rg} onChange={f("rg")} placeholder="00.000.000-0" />
              </div>
            </div>
          </div>

          <div>
            <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-4">Endereço</p>
            <div className="grid md:grid-cols-2 gap-4">
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

          <Button type="submit" disabled={saving} className="w-full h-12 font-black rounded-full bg-primary text-black hover:bg-primary/90 text-base">
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Salvando..." : "Salvar Perfil"}
          </Button>
        </form>

        {/* Seção Face ID */}
        <div className="mt-10">
          <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
            <Fingerprint className="w-3.5 h-3.5" />Segurança Biométrica
          </p>
          <div className="bg-card border border-white/10 rounded-2xl p-5">
            <p className="text-white font-black text-sm mb-1">Face ID / Digital</p>
            <p className="text-white/40 text-xs mb-4">
              Cadastre seu Face ID ou digital para entrar no portal sem precisar digitar sua senha.
              Funciona com Face ID (iPhone/Mac), digital (Android) e Windows Hello.
            </p>
            <BiometricEnroll />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
