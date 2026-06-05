import { useState } from "react";
import { startAuthentication } from "@simplewebauthn/browser";
import { Fingerprint, Loader2, AlertTriangle } from "lucide-react";

const EXTERNAL_API = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "");
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const API = EXTERNAL_API ?? `${BASE}/api`;

interface Props {
  email: string;
  onSuccess: (token: string, investor: { id: number; name: string; email: string; approvalStatus: string }) => void;
}

export default function BiometricLoginButton({ email, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleBiometricLogin = async () => {
    if (!email.trim()) {
      setError("Preencha o e-mail antes de usar o Face ID.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const optRes = await fetch(`${API}/webauthn/auth/options`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (!optRes.ok) {
        const err = await optRes.json();
        throw new Error(err.error ?? "Erro ao obter opções de autenticação.");
      }
      const options = await optRes.json();

      if (!options.hasCredentials) {
        setError("Nenhum dispositivo com Face ID cadastrado para este e-mail. Faça login com senha primeiro.");
        setLoading(false);
        return;
      }

      let authResponse;
      try {
        authResponse = await startAuthentication({ optionsJSON: options });
      } catch (e: unknown) {
        const err = e as { name?: string };
        if (err?.name === "NotAllowedError") throw new Error("Acesso biométrico negado ou cancelado.");
        throw new Error("Erro ao acessar o sensor biométrico.");
      }

      const verRes = await fetch(`${API}/webauthn/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), ...authResponse }),
      });
      const verData = await verRes.json();
      if (!verRes.ok) throw new Error(verData.error ?? "Autenticação falhou.");

      onSuccess(verData.token, verData.investor);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleBiometricLogin}
        disabled={loading}
        className="w-full h-12 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-primary/40 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2.5 disabled:opacity-60"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" />Verificando Face ID...</>
        ) : (
          <><Fingerprint className="w-5 h-5 text-primary" />Entrar com Face ID</>
        )}
      </button>
      {error && (
        <div className="flex items-start gap-2 bg-red-400/10 border border-red-400/20 rounded-xl p-3 text-red-300 text-xs">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />{error}
        </div>
      )}
    </div>
  );
}
