import { useRef, useState } from "react";
import { useUpload } from "@workspace/object-storage-web";
import { Upload, CheckCircle2, AlertCircle, X, FileText, Camera } from "lucide-react";

interface DocumentUploadFieldProps {
  label: string;
  description?: string;
  accept?: string;
  value?: string | null;
  onChange: (objectPath: string | null) => void;
  required?: boolean;
  allowCamera?: boolean;
}

export function DocumentUploadField({
  label, description, accept = "image/*,application/pdf",
  value, onChange, required, allowCamera,
}: DocumentUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const { uploadFile, isUploading, progress, error } = useUpload({
    onSuccess: (res) => onChange(res.objectPath),
    onError: () => {},
  });

  const handleFile = async (file: File) => {
    setFileName(file.name);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
    await uploadFile(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleRemove = () => {
    setPreview(null);
    setFileName(null);
    onChange(null);
  };

  const isImage = (path: string) =>
    /\.(jpg|jpeg|png|webp|gif)$/i.test(path) || !!preview;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <label className="text-white/50 text-xs font-bold uppercase tracking-wider">
          {label}{required && <span className="text-red-400 ml-0.5">*</span>}
        </label>
        {value && <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />}
      </div>

      {description && <p className="text-white/30 text-xs">{description}</p>}

      {value ? (
        <div className="relative bg-white/5 border border-green-400/20 rounded-xl p-3 flex items-center gap-3">
          {preview ? (
            <img src={preview} alt="preview" className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
          ) : (
            <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-white/40" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-green-300 text-xs font-bold">Enviado com sucesso</p>
            {fileName && <p className="text-white/40 text-xs truncate">{fileName}</p>}
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-white/30 hover:text-red-400 p-1 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div>
          {isUploading ? (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-4 h-4 border-2 border-primary/60 border-t-primary rounded-full animate-spin" />
                <span className="text-white/50 text-sm">Enviando… {progress}%</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : error ? (
            <div
              className="bg-red-400/10 border border-red-400/20 rounded-xl p-3 flex items-center gap-2 cursor-pointer hover:bg-red-400/15 transition-colors"
              onClick={() => inputRef.current?.click()}
            >
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-300 text-xs font-bold">Erro no envio. Tentar novamente?</p>
                <p className="text-red-300/50 text-xs">{error.message}</p>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex-1 flex items-center gap-2 bg-white/5 border border-dashed border-white/20 rounded-xl p-3 hover:border-primary/40 hover:bg-white/8 transition-all text-left"
              >
                <Upload className="w-4 h-4 text-white/40 flex-shrink-0" />
                <span className="text-white/50 text-sm">Selecionar arquivo</span>
              </button>
              {allowCamera && (
                <button
                  type="button"
                  onClick={() => cameraRef.current?.click()}
                  className="flex items-center gap-2 bg-white/5 border border-dashed border-white/20 rounded-xl px-3 hover:border-primary/40 hover:bg-white/8 transition-all"
                  title="Usar câmera"
                >
                  <Camera className="w-4 h-4 text-white/40" />
                </button>
              )}
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            className="sr-only"
          />
          {allowCamera && (
            <input
              ref={cameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleChange}
              className="sr-only"
            />
          )}
        </div>
      )}
    </div>
  );
}
