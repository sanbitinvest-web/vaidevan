import { useState, useEffect } from "react";
import { startRegistration } from "@simplewebauthn/browser";
import { Fingerprint, CheckCircle2, AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const EXTERNAL_API = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "");
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const API = EXTERNAL_API ?? `${BASE}/api`;

function getToken() { return localStorage.getItem("vdv_token"); }
function authHeaders() {
  const t = getToken();
  return { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}) };
}

type Credential = { id: number; credentialDeviceType: string | null; createdAt: string; lastUsedAt: string | null };

export default function BiometricEnroll({ onEnrolled }: { onEnrolled?: () => void }) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loadingCreds, setLoadingCreds] = useState(true);

  useEffect(() => {
    PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      .then(setSupported)
      .catch(() => setSupported(false));
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    setLoadingCreds(true);
    try {
      const res = await fetch(`${API}/webauthn/credentials`, { headers: authHeaders() });
      if (res.ok) setCredentials(await res.json());
    } catch { /* silent */ }
    finally { setLoadingCreds(false); }
  };

  const handleEnroll = async () => {
    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      const optRes = await fetch(`${API}/webauthn/register/options`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({}),
      });
      if (!optRes.ok) {
        const err = await optRes.json();
        throw new Error(err.error ?? "Erro ao obter opções.");
      }
      const options = await optRes.json();

      let registrationResponse;
      try {
        registrationResponse = await startRegistration({ optionsJSON: options });
      } catch (e: unknown) {
        const err = e as { name?: string };
        if (err?.name === "NotAllowedError") throw new Error("Acesso biométrico negado ou cancelado.");
        if (err?.name === "InvalidStateError") throw new Error("Este dispositivo já está cadastrado.");
        throw new Error("Erro ao acessar o sensor biométrico.");
      }

      const verRes = await fetch(`${API}/webauthn/register/verify`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(registrationResponse),
      });
      const verData = await verRes.json();
      if (!verRes.ok) throw new Error(verData.error ?? "Verificação falhou.");

      setStatus("success");
      setMessage(verData.message ?? "Face ID cadastrado!");
      await loadCredentials();
      onEnrolled?.();
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Remover este dispositivo biométrico?")) return;
    try {
      await fetch(`${API}/webauthn/credentials/${id}`, { method: "DELETE", headers: authHeaders() });
      setCredentials(c => c.filter(x => x.id !== id));
    } catch { /* silent */ }
  };

  if (supported === false) {
    return (
      <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-yellow-300 font-bold text-sm">Biometria não suportada</p>
          <p className="text-white/50 text-xs mt-0.5">Este dispositivo ou navegador não suporta autenticação biométrica (Face ID / Touch ID).</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Dispositivos cadastrados */}
      {!loadingCreds && credentials.length > 0 && (
        <div className="bg-green-400/5 border border-green-400/20 rounded-2xl p-4 space-y-2">
          <p className="text-green-300 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Dispositivos com Face ID cadastrados
          </p>
          {credentials.map(c => (
            <div key={c.id} className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-semibold">
                  {c.credentialDeviceType === "multiDevice" ? "🌐 Passkey multi-dispositivo" : "📱 Este dispositivo"}
                </p>
                <p className="text-white/40 text-xs">
                  Cadastrado {new Date(c.createdAt).toLocaleDateString("pt-BR")}
                  {c.lastUsedAt ? ` · Usado ${new Date(c.lastUsedAt).toLocaleDateString("pt-BR")}` : ""}
                </p>
              </div>
              <button onClick={() => handleDelete(c.id)}
                className="p-1.5 text-red-400/40 hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Feedback */}
      {status === "success" && (
        <div className="bg-green-400/10 border border-green-400/20 rounded-xl p-3 flex items-center gap-2 text-green-300 text-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />{message}
        </div>
      )}
      {status === "error" && (
        <div className="bg-red-400/10 border border-red-400/20 rounded-xl p-3 flex items-center gap-2 text-red-300 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />{message}
        </div>
      )}

      {/* Botão cadastrar */}
      <Button
        onClick={handleEnroll}
        disabled={loading || supported === null}
        className="w-full h-12 bg-primary/10 hover:bg-primary/20 border border-primary/30 hover:border-primary/60 text-primary font-black rounded-xl transition-all"
      >
        {loading ? (
          <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Aguardando biometria...</span>
        ) : supported === null ? (
          <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Verificando suporte...</span>
        ) : (
          <span className="flex items-center gap-2">
            <Fingerprint className="w-5 h-5" />
            {credentials.length > 0 ? "Adicionar outro dispositivo" : "Cadastrar Face ID / Digital"}
          </span>
        )}
      </Button>
      <p className="text-white/30 text-xs text-center">
        Usa Face ID, Touch ID, digital ou Windows Hello — nenhum dado biométrico sai do seu dispositivo.
      </p>
    </div>
  );
}
