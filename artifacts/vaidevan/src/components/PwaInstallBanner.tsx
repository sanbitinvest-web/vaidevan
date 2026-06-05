import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;

    const stored = localStorage.getItem("vdv-pwa-dismissed");
    if (stored && Date.now() - Number(stored) < 7 * 24 * 3600 * 1000) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setVisible(true), 4000);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [dismissed]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    localStorage.setItem("vdv-pwa-dismissed", String(Date.now()));
  };

  if (!visible || !deferredPrompt) return null;

  return (
    <div
      role="dialog"
      aria-label="Instalar VaideVan"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] w-[min(92vw,420px)]
                 bg-[#0A0A0A] border border-[#F5E642]/30 rounded-2xl shadow-2xl
                 flex items-center gap-3 px-4 py-3 animate-fade-in-up"
    >
      <img
        src="/icons/icon-72x72.png"
        alt="VaideVan"
        width={44}
        height={44}
        className="rounded-full shrink-0"
        loading="lazy"
      />
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm leading-tight">Instalar VaideVan</p>
        <p className="text-[#aaa] text-xs mt-0.5 leading-tight">
          Acesso rápido · Funciona offline
        </p>
      </div>
      <button
        onClick={handleInstall}
        className="shrink-0 flex items-center gap-1.5 bg-[#F5E642] text-[#0A0A0A]
                   text-xs font-bold px-3 py-1.5 rounded-full hover:opacity-85 transition-opacity"
        aria-label="Instalar aplicativo"
      >
        <Download size={13} />
        Instalar
      </button>
      <button
        onClick={handleDismiss}
        className="shrink-0 text-[#555] hover:text-white transition-colors ml-1"
        aria-label="Fechar"
      >
        <X size={18} />
      </button>
    </div>
  );
}
