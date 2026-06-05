import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { api, ApiInvestorProfile } from "@/lib/api";
import { DocumentUploadField } from "@/components/portal/DocumentUploadField";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2, Clock, XCircle, FolderCheck, AlertCircle, Info,
  Fingerprint, ShieldCheck, ExternalLink, Lock, FileText, Home,
} from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  if (status === "aprovado") return (
    <span className="flex items-center gap-1.5 text-green-400 text-xs font-bold bg-green-400/10 px-3 py-1 rounded-full">
      <CheckCircle2 className="w-3.5 h-3.5" /> Aprovado
    </span>
  );
  if (status === "rejeitado") return (
    <span className="flex items-center gap-1.5 text-red-400 text-xs font-bold bg-red-400/10 px-3 py-1 rounded-full">
      <XCircle className="w-3.5 h-3.5" /> Rejeitado
    </span>
  );
  return (
    <span className="flex items-center gap-1.5 text-yellow-400 text-xs font-bold bg-yellow-400/10 px-3 py-1 rounded-full">
      <Clock className="w-3.5 h-3.5" /> Em análise
    </span>
  );
}

export default function Documentos() {
  const [profile, setProfile] = useState<ApiInvestorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState("");
  const [cnhUrl, setCnhUrl] = useState<string | null>(null);
  const [addressProofUrl, setAddressProofUrl] = useState<string | null>(null);

  useEffect(() => {
    api.profile().then(p => {
      setProfile(p);
      setCnhUrl(p.cnhUrl);
      setAddressProofUrl(p.addressProofUrl);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true); setSaved(false);
    try {
      const updated = await api.updateDocuments({
        cnhUrl: cnhUrl ?? undefined,
        addressProofUrl: addressProofUrl ?? undefined,
      });
      setProfile(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const handleGovBrVerify = async () => {
    setVerifying(true);
    setVerifyMsg("");
    try {
      await api.verifyGovBr();
      const updated = await api.profile();
      setProfile(updated);
      setVerifyMsg("Identidade verificada com sucesso via Gov.BR.");
    } catch (e: unknown) {
      setVerifyMsg(e instanceof Error ? e.message : "Erro ao verificar identidade.");
    } finally {
      setVerifying(false);
    }
  };

  const changed = cnhUrl !== profile?.cnhUrl || addressProofUrl !== profile?.addressProofUrl;

  const kycComplete = profile?.govBrVerified && profile.cnhStatus === "aprovado" && profile.addressProofStatus === "aprovado";

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">

        <div className="mb-6">
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <FolderCheck className="w-6 h-6 text-primary" />
            Documentos & Verificação
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Envie e acompanhe a análise dos seus documentos obrigatórios para o KYC.
          </p>
        </div>

        {/* Status geral KYC */}
        <div className={`rounded-2xl p-4 flex items-start gap-3 mb-6 ${kycComplete ? "bg-green-400/5 border border-green-400/20" : "bg-primary/5 border border-primary/20"}`}>
          {kycComplete
            ? <ShieldCheck className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
            : <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          }
          <div>
            <p className={`text-sm font-bold ${kycComplete ? "text-green-400" : "text-white/80"}`}>
              {kycComplete ? "✓ KYC Completo — Acesso total liberado" : "Verificação de identidade em andamento"}
            </p>
            <p className="text-white/50 text-xs mt-1 leading-relaxed">
              {kycComplete
                ? "Todos os seus documentos foram verificados. Você pode assinar contratos e acessar todas as funcionalidades."
                : "Todos os documentos são verificados junto aos órgãos competentes. Análise em até 24h úteis. Documentos aprovados liberam assinatura de contratos."
              }
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary/60 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-5">

            {/* ──── Face ID / Gov.BR ──── */}
            <div className={`bg-card border rounded-2xl p-5 space-y-4 ${profile?.govBrVerified ? "border-green-400/30" : "border-white/10"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fingerprint className={`w-5 h-5 ${profile?.govBrVerified ? "text-green-400" : "text-primary"}`} />
                  <h2 className="text-white font-bold">Face ID / Verificação Gov.BR</h2>
                </div>
                {profile?.govBrVerified
                  ? <span className="flex items-center gap-1.5 text-green-400 text-xs font-bold bg-green-400/10 px-3 py-1 rounded-full"><CheckCircle2 className="w-3.5 h-3.5" /> Verificado</span>
                  : <span className="flex items-center gap-1.5 text-yellow-400 text-xs font-bold bg-yellow-400/10 px-3 py-1 rounded-full"><Clock className="w-3.5 h-3.5" /> Pendente</span>
                }
              </div>

              {profile?.govBrVerified ? (
                <div className="flex items-start gap-3 bg-green-400/5 rounded-xl p-4">
                  <ShieldCheck className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-400 text-sm font-bold">Identidade confirmada</p>
                    <p className="text-white/40 text-xs mt-1">
                      Verificado via autenticação biométrica Gov.BR em{" "}
                      {profile.govBrVerifiedAt
                        ? new Date(profile.govBrVerifiedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
                        : "data registrada"}.
                    </p>
                    {profile.govBrId && (
                      <p className="text-white/30 text-xs mt-1 font-mono">ID Gov.BR: {profile.govBrId}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-white/40 text-sm leading-relaxed">
                    A verificação biométrica pelo <strong className="text-white/70">Gov.BR</strong> confirma sua identidade com validação junto à Receita Federal e DENATRAN.
                    É obrigatória para assinar contratos de investimento.
                  </p>
                  <div className="bg-background/60 rounded-xl p-3 space-y-2 text-xs text-white/40">
                    <p className="font-bold text-white/60 mb-2">Como funciona:</p>
                    <p>1. Clique no botão abaixo para iniciar a verificação Gov.BR</p>
                    <p>2. Você será redirecionado para autenticar seu CPF e biometria facial</p>
                    <p>3. Após a confirmação, seu status é atualizado automaticamente</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleGovBrVerify}
                      disabled={verifying}
                      className="w-full py-3 rounded-xl bg-primary text-black font-black text-sm hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      {verifying
                        ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> Verificando…</>
                        : <><Fingerprint className="w-4 h-4" /> Verificar identidade com Face ID</>
                      }
                    </button>
                    <a
                      href="https://www.gov.br/governodigital/pt-br/conta-gov-br/conta-gov-br"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" /> Saiba mais sobre o Gov.BR
                    </a>
                  </div>
                  {verifyMsg && (
                    <p className={`text-xs text-center px-3 py-2 rounded-xl ${verifyMsg.includes("sucesso") ? "text-green-400 bg-green-400/10" : "text-red-400 bg-red-400/10"}`}>
                      {verifyMsg}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* ──── CNH ──── */}
            <div className="bg-card border border-white/10 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-white/50" />
                  <h2 className="text-white font-bold">CNH Digital</h2>
                </div>
                {profile?.cnhUrl && <StatusBadge status={profile.cnhStatus} />}
              </div>
              <p className="text-white/40 text-sm">
                Carteira Nacional de Habilitação (frente e verso, ou versão digital). Validada automaticamente no DETRAN.
              </p>
              {profile?.cnhStatus === "rejeitado" && (
                <div className="flex gap-2 bg-red-400/10 border border-red-400/20 rounded-xl p-3">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-red-300 text-sm">Documento rejeitado. Envie uma nova imagem nítida e legível.</p>
                </div>
              )}
              <DocumentUploadField
                label="CNH"
                accept="image/*,application/pdf"
                value={cnhUrl}
                onChange={setCnhUrl}
                required
                allowCamera
              />
            </div>

            {/* ──── Comprovante de Endereço ──── */}
            <div className="bg-card border border-white/10 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-white/50" />
                  <h2 className="text-white font-bold">Comprovante de Endereço</h2>
                </div>
                {profile?.addressProofUrl && <StatusBadge status={profile.addressProofStatus} />}
              </div>
              <p className="text-white/40 text-sm">
                Conta de água, luz ou telefone fixo em seu nome, com no máximo 90 dias de emissão.
              </p>
              {profile?.addressProofStatus === "rejeitado" && (
                <div className="flex gap-2 bg-red-400/10 border border-red-400/20 rounded-xl p-3">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-red-300 text-sm">Documento rejeitado. Envie uma nova cópia legível.</p>
                </div>
              )}
              <DocumentUploadField
                label="Comprovante"
                accept="image/*,application/pdf"
                value={addressProofUrl}
                onChange={setAddressProofUrl}
                required
                allowCamera
              />
            </div>

            {/* ──── Resumo de status ──── */}
            <div className="bg-card border border-white/10 rounded-2xl p-5">
              <h2 className="text-white font-bold mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4 text-white/50" /> Resumo do KYC
              </h2>
              <div className="space-y-2.5">
                {[
                  { label: "Face ID / Gov.BR", ok: profile?.govBrVerified, status: profile?.govBrVerified ? "aprovado" : "pendente", has: true },
                  { label: "CNH Digital",        ok: profile?.cnhStatus === "aprovado", status: profile?.cnhUrl ? profile.cnhStatus : "pendente", has: !!profile?.cnhUrl },
                  { label: "Comprovante de Endereço", ok: profile?.addressProofStatus === "aprovado", status: profile?.addressProofUrl ? profile.addressProofStatus : "pendente", has: !!profile?.addressProofUrl },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                    <span className="text-white/60 text-sm">{item.label}</span>
                    {item.has
                      ? <StatusBadge status={item.status} />
                      : <span className="text-white/25 text-xs">Não enviado</span>
                    }
                  </div>
                ))}
              </div>
            </div>

            {(changed || saved) && (
              <div className="flex items-center gap-3">
                {saved && (
                  <span className="flex items-center gap-1.5 text-green-400 text-sm">
                    <CheckCircle2 className="w-4 h-4" /> Documentos enviados para análise
                  </span>
                )}
                {changed && !saved && (
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="h-11 px-8 font-black rounded-full bg-primary text-black hover:bg-primary/90 w-full"
                  >
                    {saving ? "Enviando…" : "Salvar e enviar para análise"}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
