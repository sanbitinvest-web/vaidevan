import { useRef, useState, useCallback } from "react";
import { Camera, MapPin, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { useGeolocation, formatCoords, GeoCoords } from "@/hooks/useGeolocation";

export type CapturedPhoto = {
  id: string;
  dataUrl: string;
  filename: string;
  coords: GeoCoords | null;
  takenAt: string;
  section: string;
};

interface CameraCaptureProps {
  section: string;
  label: string;
  maxPhotos?: number;
  photos: CapturedPhoto[];
  onChange: (photos: CapturedPhoto[]) => void;
}

export function CameraCapture({
  section,
  label,
  maxPhotos = 4,
  photos,
  onChange,
}: CameraCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [capturing, setCapturing] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const { requestOnce } = useGeolocation();

  const handleCapture = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!inputRef.current) return;
      inputRef.current.value = "";
      if (!file) return;

      setCapturing(true);
      setGeoError(null);

      let coords: GeoCoords | null = null;
      try {
        coords = await requestOnce();
      } catch (err) {
        setGeoError(err instanceof Error ? err.message : "Localização indisponível.");
      }

      const reader = new FileReader();
      reader.onload = () => {
        const photo: CapturedPhoto = {
          id: `${section}-${Date.now()}`,
          dataUrl: reader.result as string,
          filename: file.name || `vistoria_${section}_${Date.now()}.jpg`,
          coords,
          takenAt: new Date().toLocaleString("pt-BR"),
          section,
        };
        onChange([...photos, photo]);
        setCapturing(false);
      };
      reader.readAsDataURL(file);
    },
    [section, photos, onChange, requestOnce]
  );

  const remove = useCallback(
    (id: string) => onChange(photos.filter((p) => p.id !== id)),
    [photos, onChange]
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-white/70 text-xs font-semibold uppercase tracking-wide">
          {label}
        </span>
        <span className="text-white/30 text-xs">
          {photos.length}/{maxPhotos} fotos
        </span>
      </div>

      {geoError && (
        <div className="flex items-start gap-2 bg-yellow-400/10 border border-yellow-400/30 rounded-xl px-3 py-2 text-xs text-yellow-300">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>{geoError} A foto foi salva sem localização.</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        {photos.map((p) => (
          <div key={p.id} className="relative rounded-xl overflow-hidden aspect-video bg-white/5 border border-white/10 group">
            <img src={p.dataUrl} alt="vistoria" className="w-full h-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 bg-black/70 px-1.5 py-1">
              {p.coords ? (
                <p className="text-[9px] text-green-300 font-mono leading-tight flex items-center gap-0.5">
                  <MapPin className="w-2.5 h-2.5 shrink-0" />
                  {formatCoords(p.coords.lat, p.coords.lng)}
                </p>
              ) : (
                <p className="text-[9px] text-yellow-400 leading-tight">Sem GPS</p>
              )}
              <p className="text-[8px] text-white/50 leading-tight">{p.takenAt}</p>
            </div>
            <button
              onClick={() => remove(p.id)}
              className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remover foto"
            >
              <Trash2 className="w-3 h-3 text-white" />
            </button>
          </div>
        ))}

        {photos.length < maxPhotos && (
          <button
            onClick={() => inputRef.current?.click()}
            disabled={capturing}
            className="aspect-video rounded-xl border-2 border-dashed border-white/20 hover:border-primary/60
                       flex flex-col items-center justify-center gap-1 text-white/40 hover:text-primary
                       transition-colors bg-white/5 hover:bg-primary/5 disabled:opacity-50 disabled:cursor-wait"
          >
            {capturing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Camera className="w-5 h-5" />
                <span className="text-[10px] font-semibold">Tirar foto</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleCapture}
      />
    </div>
  );
}
