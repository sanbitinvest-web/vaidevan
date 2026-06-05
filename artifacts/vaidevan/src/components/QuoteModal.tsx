import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ContactForm } from "./ContactForm";

interface QuoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTipo?: string;
}

export function QuoteModal({ open, onOpenChange, defaultTipo }: QuoteModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border border-white/10 max-w-lg w-full rounded-3xl p-0 overflow-hidden shadow-[0_0_60px_rgba(245,230,66,0.08)]">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-white/10">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute right-5 top-5 rounded-full p-1.5 text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-left">
              Solicitar Orçamento Gratuito
            </DialogTitle>
            <DialogDescription className="text-left mt-2 space-y-1">
              <span className="flex items-center gap-2 text-primary font-black text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                Equipe em prontidão — resposta imediata
              </span>
              <span className="text-white/40 text-xs block">Orçamento gratuito. Proposta personalizada para sua necessidade.</span>
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Formulário */}
        <div className="px-8 py-6">
          <ContactForm
            defaultTipo={defaultTipo}
            onSuccess={() => {
              setTimeout(() => onOpenChange(false), 3000);
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
