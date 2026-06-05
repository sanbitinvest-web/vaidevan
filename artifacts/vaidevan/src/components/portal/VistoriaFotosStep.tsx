import { useState } from "react";
import { CheckCircle2, Camera, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CameraCapture, CapturedPhoto } from "@/components/portal/CameraCapture";

export type VistoriaData = {
  photos: Record<string, CapturedPhoto[]>;
  checklist: Record<string, "ok" | "avaria" | "">;
  obs: string;
};

const SECTIONS = [
  {
    id: "frente",
    label: "Frente",
    items: ["Para-choque dianteiro", "Grade dianteira", "Faróis", "Para-brisa dianteiro"],
  },
  {
    id: "lateral_esq",
    label: "Lateral Esquerda",
    items: ["Portas (inferior/superior)", "Espelhos retrovisores", "Rodas/pneus E", "Soleira"],
  },
  {
    id: "lateral_dir",
    label: "Lateral Direita",
    items: ["Portas (inferior/superior)", "Espelhos retrovisores", "Rodas/pneus D", "Soleira"],
  },
  {
    id: "traseira",
    label: "Traseira",
    items: ["Para-choque traseiro", "Lanternas", "Para-brisa traseiro", "Porta/portão traseiro"],
  },
  {
    id: "teto",
    label: "Teto / Capô",
    items: ["Teto", "Capô", "Trilhos/calhas", "Antena"],
  },
  {
    id: "interior",
    label: "Interior / Cabine",
    items: ["Bancos e estofados", "Painéis e acabamentos", "Cinto de segurança (todos)", "Ar-condicionado", "Sistema de som/multimídia", "Tapetes e revestimento de piso"],
  },
  {
    id: "mecanico",
    label: "Itens Mecânicos / Documentação",
    items: ["Nível de combustível", "Hodômetro (KM registrado)", "CRLV/documentação", "Extintor de incêndio", "Triângulo de sinalização", "Macaco e chave de roda"],
  },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

interface VistoriaFotosStepProps {
  data: VistoriaData;
  onChange: (d: VistoriaData) => void;
  onBack: () => void;
  onConfirm: () => void;
  confirming?: boolean;
}

export function VistoriaFotosStep({ data, onChange, onBack, onConfirm, confirming }: VistoriaFotosStepProps) {
  const [open, setOpen] = useState<SectionId | null>("frente");

  const setPhotos = (section: string, photos: CapturedPhoto[]) =>
    onChange({ ...data, photos: { ...data.photos, [section]: photos } });

  const setItem = (section: string, item: string, value: "ok" | "avaria" | "") =>
    onChange({ ...data, checklist: { ...data.checklist, [`${section}__${item}`]: value } });

  const totalPhotos = Object.values(data.photos).flat().length;
  const totalAvarias = Object.values(data.checklist).filter((v) => v === "avaria").length;
  const photosMissing = SECTIONS.some((s) => (data.photos[s.id]?.length ?? 0) === 0);

  return (
    <div className="space-y-4">
      {/* Resumo */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white/5 rounded-xl p-2 border border-white/10">
          <p className="text-white font-black text-lg">{totalPhotos}</p>
          <p className="text-white/40 text-[10px]">Fotos tiradas</p>
        </div>
        <div className={`rounded-xl p-2 border ${totalAvarias > 0 ? "bg-red-500/10 border-red-500/30" : "bg-white/5 border-white/10"}`}>
          <p className={`font-black text-lg ${totalAvarias > 0 ? "text-red-400" : "text-white"}`}>{totalAvarias}</p>
          <p className="text-white/40 text-[10px]">Avarias</p>
        </div>
        <div className="bg-white/5 rounded-xl p-2 border border-white/10">
          <p className="text-white font-black text-lg">{SECTIONS.length}</p>
          <p className="text-white/40 text-[10px]">Seções</p>
        </div>
      </div>

      {photosMissing && (
        <div className="flex items-start gap-2 bg-yellow-400/10 border border-yellow-400/30 rounded-xl px-3 py-2 text-xs text-yellow-300">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>Pelo menos <strong>1 foto por seção</strong> é obrigatória para a validade do laudo.</span>
        </div>
      )}

      {/* Seções acordeão */}
      <div className="space-y-2">
        {SECTIONS.map((section) => {
          const sectionPhotos = data.photos[section.id] ?? [];
          const isOpen = open === section.id;
          const hasPhotos = sectionPhotos.length > 0;
          const checkCount = section.items.filter(
            (item) => data.checklist[`${section.id}__${item}`] === "ok" || data.checklist[`${section.id}__${item}`] === "avaria"
          ).length;

          return (
            <div key={section.id} className="border border-white/10 rounded-2xl overflow-hidden bg-white/3">
              <button
                onClick={() => setOpen(isOpen ? null : section.id)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0
                    ${hasPhotos ? "bg-green-400/20 text-green-400" : "bg-white/10 text-white/30"}`}>
                    <Camera className="w-3 h-3" />
                  </div>
                  <span className="text-white font-semibold text-sm">{section.label}</span>
                  <span className="text-white/30 text-xs">{sectionPhotos.length} foto{sectionPhotos.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex items-center gap-2">
                  {checkCount === section.items.length && (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  )}
                  {isOpen ? <ChevronUp className="w-4 h-4 text-white/30" /> : <ChevronDown className="w-4 h-4 text-white/30" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 space-y-4 border-t border-white/10 pt-4">
                  {/* Itens do checklist */}
                  <div className="space-y-1.5">
                    <p className="text-white/50 text-[10px] uppercase tracking-wide font-bold mb-2">Itens de vistoria</p>
                    {section.items.map((item) => {
                      const key = `${section.id}__${item}`;
                      const val = data.checklist[key] ?? "";
                      return (
                        <div key={item} className="flex items-center justify-between gap-2">
                          <span className="text-white/70 text-xs flex-1">{item}</span>
                          <div className="flex gap-1 shrink-0">
                            {(["ok", "avaria", ""] as const).map((opt) => (
                              <button
                                key={opt}
                                onClick={() => setItem(section.id, item, opt === val ? "" : opt)}
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors
                                  ${opt === "" ? "hidden" : ""}
                                  ${opt === "ok" && val === "ok" ? "bg-green-400 text-black border-green-400" :
                                    opt === "ok" ? "border-white/20 text-white/30 hover:border-green-400/60 hover:text-green-400" : ""}
                                  ${opt === "avaria" && val === "avaria" ? "bg-red-500 text-white border-red-500" :
                                    opt === "avaria" ? "border-white/20 text-white/30 hover:border-red-400/60 hover:text-red-400" : ""}
                                `}
                              >
                                {opt === "ok" ? "OK" : "Avaria"}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Câmera */}
                  <CameraCapture
                    section={section.id}
                    label={`Fotos — ${section.label}`}
                    maxPhotos={6}
                    photos={sectionPhotos}
                    onChange={(p) => setPhotos(section.id, p)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Observações */}
      <div>
        <label className="text-white/50 text-xs font-bold uppercase tracking-wide block mb-1.5">
          Observações gerais
        </label>
        <textarea
          rows={3}
          value={data.obs}
          onChange={(e) => onChange({ ...data, obs: e.target.value })}
          placeholder="Registre aqui qualquer observação adicional sobre o estado do veículo..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm
                     placeholder:text-white/20 focus:outline-none focus:border-primary/50 resize-none"
        />
      </div>

      {/* Ações */}
      <div className="flex gap-3 pt-2">
        <Button onClick={onBack} variant="outline" className="flex-1 h-11 rounded-full border-white/20 text-white/70">
          Voltar
        </Button>
        <Button
          onClick={onConfirm}
          disabled={confirming}
          className="flex-1 h-11 font-black rounded-full bg-primary text-black"
        >
          {confirming ? "Salvando..." : "Confirmar Vistoria"}
        </Button>
      </div>
    </div>
  );
}
