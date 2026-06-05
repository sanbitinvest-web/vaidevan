import { useState } from "react";
import { Download, CheckCircle2, Package } from "lucide-react";

const API = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "")
  ?? `${import.meta.env.BASE_URL.replace(/\/$/, "")}/api`;

export default function PacoteDownload() {
  const [downloading, setDownloading] = useState(false);
  const [done, setDone] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    const a = document.createElement("a");
    a.href = `${API}/deploy/package`;
    a.download = "vaidevan-napoleon-deploy.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => { setDownloading(false); setDone(true); }, 2000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Package className="w-10 h-10 text-primary" />
        </div>

        <h1 className="text-2xl font-black text-white mb-2">Pacote de Deploy</h1>
        <p className="text-white/50 text-sm mb-8">
          Arquivos prontos para upload no Napoleon Host (cPanel / LiteSpeed)
        </p>

        <div className="bg-card border border-white/10 rounded-2xl p-5 mb-6 text-left space-y-2">
          {[
            ["Arquivo", "vaidevan-napoleon-deploy.zip"],
            ["Tamanho", "~110 MB"],
            ["Destino", "public_html/ no cPanel"],
            ["Conteúdo", "88 arquivos — React build completo"],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-white/40">{label}</span>
              <span className="text-white font-semibold">{value}</span>
            </div>
          ))}
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full h-14 flex items-center justify-center gap-3 bg-primary text-black font-black rounded-2xl text-lg hover:bg-primary/90 transition-all disabled:opacity-70"
        >
          {done ? (
            <><CheckCircle2 className="w-5 h-5" />Download iniciado!</>
          ) : downloading ? (
            <><Download className="w-5 h-5 animate-bounce" />Baixando...</>
          ) : (
            <><Download className="w-5 h-5" />Baixar agora</>
          )}
        </button>

        <p className="text-white/30 text-xs mt-4">
          Após o download, extraia o ZIP e envie o conteúdo para <code className="text-primary/70">public_html/</code>
        </p>
      </div>
    </div>
  );
}
