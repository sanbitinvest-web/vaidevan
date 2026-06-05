import { useRef, useState, useCallback } from "react";
import { useUpload } from "@workspace/object-storage-web";
import { Camera, CheckCircle2, X, RefreshCw, User } from "lucide-react";

interface SelfieCaptureProps {
  label?: string;
  description?: string;
  value?: string | null;
  onChange: (objectPath: string | null) => void;
  required?: boolean;
}

export function SelfieCapture({
  label = "Selfie com Documento",
  description = "Segure seu documento próximo ao rosto e tire uma foto. Ambos devem estar visíveis e legíveis.",
  value,
  onChange,
  required,
}: SelfieCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);

  const { uploadFile, isUploading, progress, error } = useUpload({
    onSuccess: (res) => onChange(res.objectPath),
    onError: () => {},
  });

  const handleFile = useCallback(async (file: File) => {
    setCapturing(true);
    const reader = new FileReader();
    reader.onload = (e) => { setPreview(e.target?.result as string); setCapturing(false); };
    reader.readAsDataURL(file);
    await uploadFile(file);
  }, [uploadFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleRemove = () => { setPreview(null); onChange(null); };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <label className="text-white/50 text-xs font-bold uppercase tracking-wider">
          {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
        {value && <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />}
      </div>
      <p className="text-white/30 text-xs">{description}</p>

      {value && preview ? (
        <div className="relative">
          <img src={preview} alt="selfie" className="w-full max-h-48 object-cover rounded-xl border border-green-400/20" />
          <div className="absolute top-2 left-2 bg-green-400/90 text-black text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Enviado
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : isUploading ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <div className="w-8 h-8 border-2 border-primary/60 border-t-primary rounded-full animate-spin mx-auto mb-2" />
          <p className="text-white/50 text-sm">Enviando… {progress}%</p>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {error && (
            <p className="text-red-400 text-xs bg-red-400/10 rounded-lg px-3 py-2">{error.message}</p>
          )}

          {/* Instrução visual */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-20 h-20 bg-white/5 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center">
                <User className="w-10 h-10 text-white/20" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-6 bg-white/10 border border-white/20 rounded-sm flex items-center justify-center text-[8px] text-white/40 font-bold">
                CNH
              </div>
            </div>
            <p className="text-white/30 text-xs text-center max-w-[200px]">
              Segure o documento próximo ao rosto. Ambos devem estar visíveis.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex flex-col items-center gap-2 bg-white/5 border border-dashed border-white/20 rounded-xl p-4 hover:border-primary/40 hover:bg-white/8 transition-all"
            >
              <Camera className="w-6 h-6 text-white/50" />
              <span className="text-white/50 text-xs text-center">Câmera frontal</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.createElement("input");
                el.type = "file"; el.accept = "image/*";
                el.onchange = (e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) handleFile(f); };
                el.click();
              }}
              className="flex flex-col items-center gap-2 bg-white/5 border border-dashed border-white/20 rounded-xl p-4 hover:border-primary/40 hover:bg-white/8 transition-all"
            >
              <RefreshCw className="w-6 h-6 text-white/50" />
              <span className="text-white/50 text-xs text-center">Galeria / arquivo</span>
            </button>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="user"
        onChange={handleChange}
        className="sr-only"
      />
    </div>
  );
}
