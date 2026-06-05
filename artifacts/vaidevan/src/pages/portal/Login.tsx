import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { api } from "@/lib/api";
import BiometricLoginButton from "@/components/BiometricLoginButton";
import { Mail, Lock, Fingerprint, ArrowLeft, Loader2, CheckCircle2, RefreshCw } from "lucide-react";
import type { ApprovalStatus } from "@/context/AuthContext";

type LoginTab = "password" | "otp" | "biometric";
type OtpStep = "email" | "code";

export default function Login() {
  const { login, loginWithToken } = useAuth();
  const [, setLocation] = useLocation();

  const [tab, setTab] = useState<LoginTab>("password");

  // Password state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  // OTP state
  const [otpEmail, setOtpEmail] = useState("");
  const [otpStep, setOtpStep] = useState<OtpStep>("email");
  const [otpCode, setOtpCode] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // Demo seed
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState("");

  const resolvePortalPath = (approvalStatus: ApprovalStatus) =>
    approvalStatus === "approved" ? "/portal/dashboard" : "/portal/aguardando";

  const handlePasswordLogin = async () => {
    if (!email.trim() || !password) return;
    setPwError("");
    setPwLoading(true);
    try {
      const inv = await login(email.trim().toLowerCase(), password);
      setLocation(resolvePortalPath(inv.approvalStatus));
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Erro ao entrar");
    } finally {
      setPwLoading(false);
    }
  };

  const handleBiometricSuccess = (token: string, investor: { id: number; name: string; email: string; approvalStatus: ApprovalStatus }) => {
    loginWithToken(token, investor);
    setLocation(resolvePortalPath(investor.approvalStatus));
  };

  const handleOtpSend = async () => {
    if (!otpEmail.trim()) { setOtpError("Informe seu e-mail"); return; }
    setOtpSending(true);
    setOtpError("");
    try {
      await api.otpSend(otpEmail.trim().toLowerCase());
      setOtpSent(true);
      setOtpStep("code");
      setOtpCode("");
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : "Erro ao enviar código");
    } finally {
      setOtpSending(false);
    }
  };

  const handleOtpVerify = async () => {
    if (otpCode.length < 6) { setOtpError("Digite os 6 dígitos do código"); return; }
    setOtpVerifying(true);
    setOtpError("");
    try {
      const data = await api.otpVerify(otpEmail.trim().toLowerCase(), otpCode);
      loginWithToken(data.token, data.investor);
      setLocation(resolvePortalPath(data.investor.approvalStatus as ApprovalStatus));
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : "Código inválido ou expirado");
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setOtpSending(true);
    setOtpError("");
    setOtpCode("");
    try {
      await api.otpSend(otpEmail.trim().toLowerCase());
      setOtpSent(true);
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : "Erro ao reenviar");
    } finally {
      setOtpSending(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const r = await api.seed();
      setSeedMsg(`${r.message}${r.investorEmail ? ` Login: ${r.investorEmail} / Senha: ${r.password}` : ""}`);
    } catch (err) {
      setSeedMsg("Erro: " + (err instanceof Error ? err.message : "desconhecido"));
    } finally {
      setSeeding(false);
    }
  };

  const inp = "w-full bg-background border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-primary transition-colors";

  const tabs: { key: LoginTab; label: string; icon: React.ReactNode }[] = [
    { key: "password", label: "Senha", icon: <Lock className="w-3.5 h-3.5" /> },
    { key: "otp", label: "Código", icon: <Mail className="w-3.5 h-3.5" /> },
    { key: "biometric", label: "Face ID", icon: <Fingerprint className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <img src="/logo-black-sm.webp" alt="VaideVan" className="h-20 w-auto mx-auto mb-6" width="80" height="80" style={{ mixBlendMode: "screen" }} />
          <h1 className="text-2xl font-black text-white">Portal do Investidor</h1>
          <p className="text-white/50 text-sm mt-1">Acesse sua área exclusiva</p>
        </div>

        <div className="bg-card border border-white/10 rounded-3xl overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-white/10">
            {tabs.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 text-sm font-bold transition-colors ${
                  tab === key
                    ? "text-primary border-b-2 border-primary bg-primary/5"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                {icon}{label}
              </button>
            ))}
          </div>

          <div className="p-8">
            {/* ── Senha ── */}
            {tab === "password" && (
              <div className="flex flex-col gap-5">
                <div>
                  <label className="text-sm font-semibold text-white/70 mb-2 block">E-mail</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handlePasswordLogin()}
                    autoComplete="email"
                    placeholder="seu@email.com" className={inp} />
                </div>
                <div>
                  <label className="text-sm font-semibold text-white/70 mb-2 block">Senha</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handlePasswordLogin()}
                    autoComplete="current-password"
                    placeholder="••••••••" className={inp} />
                </div>
                {pwError && <p className="text-red-400 text-sm text-center">{pwError}</p>}
                <Button type="button" onClick={handlePasswordLogin} disabled={pwLoading || !email.trim() || !password}
                  className="h-12 font-black rounded-full bg-primary text-black hover:bg-primary/90 text-base">
                  {pwLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Entrando...</> : "Entrar com senha"}
                </Button>
              </div>
            )}

            {/* ── OTP / Código por e-mail ── */}
            {tab === "otp" && (
              <div className="flex flex-col gap-5">
                {otpStep === "email" ? (
                  <div className="flex flex-col gap-5">
                    <div className="text-center mb-1">
                      <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Mail className="w-7 h-7 text-primary" />
                      </div>
                      <p className="text-white/60 text-sm">Enviaremos um código de 6 dígitos para o seu e-mail cadastrado.</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-white/70 mb-2 block">E-mail</label>
                      <input type="email" value={otpEmail} onChange={e => setOtpEmail(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleOtpSend()}
                        autoComplete="email"
                        placeholder="seu@email.com" className={inp} />
                    </div>
                    {otpError && <p className="text-red-400 text-sm text-center">{otpError}</p>}
                    <Button type="button" onClick={handleOtpSend} disabled={otpSending || !otpEmail.trim()}
                      className="h-12 font-black rounded-full bg-primary text-black hover:bg-primary/90 text-base">
                      {otpSending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Enviando...</> : <>Enviar código</>}
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-5">
                    <div className="text-center mb-1">
                      {otpSent && (
                        <div className="flex items-center justify-center gap-2 text-green-400 text-sm mb-3">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Código enviado para <strong>{otpEmail}</strong></span>
                        </div>
                      )}
                      <p className="text-white/60 text-sm">Digite o código de 6 dígitos recebido por e-mail.</p>
                      <p className="text-white/30 text-xs mt-1">Válido por 10 minutos</p>
                    </div>

                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={otpCode}
                        onChange={setOtpCode}
                        onComplete={handleOtpVerify}
                      >
                        <InputOTPGroup>
                          {[0,1,2,3,4,5].map(i => (
                            <InputOTPSlot
                              key={i}
                              index={i}
                              className="w-11 h-14 text-xl font-black border-white/30 bg-white/10 text-white first:rounded-l-xl last:rounded-r-xl"
                            />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </div>

                    {otpError && <p className="text-red-400 text-sm text-center">{otpError}</p>}

                    <Button
                      onClick={handleOtpVerify}
                      disabled={otpVerifying || otpCode.length < 6}
                      className="h-12 font-black rounded-full bg-primary text-black hover:bg-primary/90 text-base"
                    >
                      {otpVerifying ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verificando...</> : "Verificar código"}
                    </Button>

                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => { setOtpStep("email"); setOtpCode(""); setOtpError(""); setOtpSent(false); }}
                        className="text-white/40 hover:text-white text-sm flex items-center gap-1 transition-colors"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />Trocar e-mail
                      </button>
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={otpSending}
                        className="text-primary/70 hover:text-primary text-sm flex items-center gap-1 transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${otpSending ? "animate-spin" : ""}`} />
                        {otpSending ? "Reenviando..." : "Reenviar código"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Face ID ── */}
            {tab === "biometric" && (
              <div className="flex flex-col gap-5">
                <div className="text-center mb-1">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Fingerprint className="w-7 h-7 text-primary" />
                  </div>
                  <p className="text-white/60 text-sm">
                    Entre com Face ID, Touch ID ou Windows Hello. É necessário ter cadastrado o dispositivo previamente no seu perfil.
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-white/70 mb-2 block">E-mail</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com" className={inp} />
                </div>
                <BiometricLoginButton email={email} onSuccess={handleBiometricSuccess} />
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-white/30 text-xs mb-2">Ambiente de demonstração</p>
          <button onClick={handleSeed} disabled={seeding}
            className="text-primary/60 text-xs underline hover:text-primary transition-colors">
            {seeding ? "Criando dados..." : "Criar dados de exemplo"}
          </button>
          {seedMsg && <p className="text-white/60 text-xs mt-2 bg-card rounded-xl p-3">{seedMsg}</p>}
        </div>

        <p className="text-center mt-6 text-white/30 text-xs">
          <a href="/" className="hover:text-white transition-colors">← Voltar ao site</a>
        </p>
      </div>
    </div>
  );
}
