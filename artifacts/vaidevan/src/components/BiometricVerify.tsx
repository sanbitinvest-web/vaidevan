/**
 * Componente de verificação biométrica para uso público
 * (parceiros e locatários sem conta no portal).
 */
import { useState, useEffect } from "react";
import { startRegistration } from "@simplewebauthn/browser";
import { Fingerprint, CheckCircle2, AlertTriangle, Loader2, ShieldCheck, ScanFace } from "lucide-react";
import { useTranslation } from "react-i18next";

const EXTERNAL_API = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "");
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const API = EXTERNAL_API ?? `${BASE}/api`;

interface Props {
  email: string;
  name?: string;
  userType: "partner" | "client";
  onVerified?: () => void;
  compact?: boolean;
}

export default function BiometricVerify({ email, name, userType, onVerified, compact = false }: Props) {
  const { t } = useTranslation();
  const [supported, setSupported] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [enrolled, setEnrolled] = useState<boolean | null>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (typeof PublicKeyCredential !== "undefined" && PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then(setSupported)
        .catch(() => setSupported(false));
    } else {
      setSupported(false);
    }
  }, []);

  useEffect(() => {
    if (!email) return;
    fetch(`${API}/webauthn/public/status?email=${encodeURIComponent(email)}&userType=${userType}`)
      .then(r => r.json())
      .then(d => setEnrolled(d.enrolled))
      .catch(() => setEnrolled(false));
  }, [email, userType]);

  const handleVerify = async () => {
    if (!email) return;
    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      const optRes = await fetch(`${API}/webauthn/public/register/options`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), name: name ?? email, userType }),
      });
      if (!optRes.ok) {
        const err = await optRes.json();
        throw new Error(err.error ?? "Erro ao gerar opções.");
      }
      const options = await optRes.json();

      let registrationResponse;
      try {
        registrationResponse = await startRegistration({ optionsJSON: options });
      } catch (e: unknown) {
        const err = e as { name?: string };
        if (err?.name === "NotAllowedError") throw new Error(t("biometric.denied"));
        if (err?.name === "InvalidStateError") throw new Error(t("biometric.already"));
        throw new Error(t("biometric.error"));
      }

      const verRes = await fetch(`${API}/webauthn/public/register/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          name: name ?? email,
          userType,
          registrationResponse,
        }),
      });
      const verData = await verRes.json();
      if (!verRes.ok) throw new Error(verData.error ?? "Verificação falhou.");

      setStatus("success");
      setMessage(t("biometric.success"));
      setEnrolled(true);
      onVerified?.();
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Modo compacto ── */
  if (compact) {
    if (supported === false) {
      return (
        <div className="flex items-center gap-2 text-white/30 text-xs">
          <ScanFace className="w-3.5 h-3.5" />
          <span>{t("biometric.not_supported")}</span>
        </div>
      );
    }
    return (
      <div className="space-y-2">
        {enrolled ? (
          <div className="flex items-center gap-2 text-green-400 text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span className="font-bold">{t("biometric.enrolled")}</span>
          </div>
        ) : (
          <button type="button" onClick={handleVerify} disabled={loading || !email || supported === null}
            className="flex items-center gap-2 text-primary/80 hover:text-primary text-xs font-bold transition-colors disabled:opacity-40">
            {loading
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />{t("biometric.checking")}</>
              : <><ScanFace className="w-3.5 h-3.5" />{t("biometric.compact_button")}</>
            }
          </button>
        )}
        {status === "error" && (
          <p className="text-red-400 text-xs flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />{message}
          </p>
        )}
      </div>
    );
  }

  /* ── Modo dispositivo não suportado (full card) ── */
  if (supported === false) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-3 opacity-60">
        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0">
          <ScanFace className="w-5 h-5 text-white/40" />
        </div>
        <div>
          <p className="text-white/50 font-bold text-sm">{t("biometric.not_supported")}</p>
          <p className="text-white/30 text-xs mt-0.5">{t("biometric.not_supported_desc")}</p>
        </div>
      </div>
    );
  }

  /* ── Modo full card (suportado) ── */
  return (
    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
          <ScanFace className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-white font-black text-sm">{t("biometric.title")}</p>
          <p className="text-white/50 text-xs mt-0.5">{t("biometric.desc")}</p>
        </div>
      </div>

      {enrolled ? (
        <div className="flex items-center gap-2 bg-green-400/10 border border-green-400/20 rounded-xl p-3 text-green-300 text-sm">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span className="font-bold">{t("biometric.success")}</span>
        </div>
      ) : (
        <>
          {status === "success" && (
            <div className="flex items-center gap-2 bg-green-400/10 border border-green-400/20 rounded-xl p-3 text-green-300 text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0" />{message}
            </div>
          )}
          {status === "error" && (
            <div className="flex items-center gap-2 bg-red-400/10 border border-red-400/20 rounded-xl p-3 text-red-300 text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0" />{message}
            </div>
          )}
          <button
            type="button"
            onClick={handleVerify}
            disabled={loading || !email || supported === null}
            className="w-full h-12 bg-primary/15 hover:bg-primary/25 border border-primary/30 hover:border-primary/60 text-primary font-black rounded-xl transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" />{t("biometric.loading")}</>
            ) : (
              <><ScanFace className="w-5 h-5" />{t("biometric.button")}</>
            )}
          </button>
          <p className="text-white/25 text-xs text-center">{t("biometric.optional")}</p>
        </>
      )}
    </div>
  );
}
