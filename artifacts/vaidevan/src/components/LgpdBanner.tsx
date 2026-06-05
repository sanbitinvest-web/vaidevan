import { useState, useEffect } from "react";
import { Link } from "wouter";
import { X, Shield } from "lucide-react";

const KEY = "vv_lgpd_v1";

export default function LgpdBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    if (stored) return;
    const timer = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  function accept() {
    localStorage.setItem(KEY, "accepted");
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(KEY, "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Consentimento LGPD"
      className="fixed bottom-0 left-0 right-0 z-[9999] px-4 pb-4 pointer-events-none"
    >
      <div className="max-w-2xl mx-auto pointer-events-auto">
        <div className="rounded-2xl border border-white/10 bg-[#0f0f0f]/95 backdrop-blur-xl shadow-2xl shadow-black/60 p-5">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm mb-1">
                Sua privacidade importa — LGPD
              </p>
              <p className="text-white/55 text-xs leading-relaxed">
                Utilizamos cookies e dados de navegação para melhorar a experiência no site, personalizar conteúdo e analisar o tráfego.
                Ao continuar navegando ou clicar em{" "}
                <strong className="text-white/80">Aceitar</strong>, você consente com o uso de seus dados nos termos da{" "}
                <strong className="text-white/80">Lei 13.709/18 (LGPD)</strong>.{" "}
                <Link
                  href="/privacidade"
                  className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
                >
                  Leia nossa Política de Privacidade
                </Link>
                .
              </p>
            </div>
            <button
              onClick={decline}
              className="text-white/30 hover:text-white/60 transition-colors flex-shrink-0 p-0.5"
              aria-label="Fechar banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2 mt-4 justify-end">
            <button
              onClick={decline}
              className="text-white/40 hover:text-white/70 text-xs px-4 py-2 rounded-lg transition-colors border border-white/10 hover:border-white/20"
            >
              Recusar não essenciais
            </button>
            <button
              onClick={accept}
              className="bg-primary text-black font-bold text-xs px-5 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Aceitar todos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
