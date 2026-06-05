import { useState } from "react";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";

export interface CommercialRef {
  name: string;
  phone: string;
  email: string;
}

interface CommercialRefsFormProps {
  value: CommercialRef[];
  onChange: (refs: CommercialRef[]) => void;
}

const EMPTY_REF: CommercialRef = { name: "", phone: "", email: "" };

export function CommercialRefsForm({ value, onChange }: CommercialRefsFormProps) {
  const inp = "w-full bg-background border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-primary/50 transition-colors";

  const setRef = (idx: number, field: keyof CommercialRef, v: string) => {
    const next = value.map((r, i) => i === idx ? { ...r, [field]: v } : r);
    onChange(next);
  };

  const addRef = () => {
    if (value.length < 3) onChange([...value, { ...EMPTY_REF }]);
  };

  const removeRef = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const complete = (r: CommercialRef) => r.name.trim() && r.phone.trim() && r.email.trim();
  const allComplete = value.length === 3 && value.every(complete);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <label className="text-white/50 text-xs font-bold uppercase tracking-wider">
            Referências Comerciais <span className="text-red-400">*</span>
          </label>
          {allComplete && <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />}
        </div>
        <span className={`text-xs font-bold ${value.length === 3 ? "text-green-400" : "text-white/30"}`}>
          {value.length}/3
        </span>
      </div>
      <p className="text-white/30 text-xs">
        Informe 3 referências comerciais: nome completo, telefone e e-mail.
      </p>

      {value.map((ref, idx) => (
        <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-white/40 text-xs font-bold">Referência {idx + 1}</span>
            <button
              type="button"
              onClick={() => removeRef(idx)}
              className="text-red-400/40 hover:text-red-400 p-0.5 rounded transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <input
            className={inp}
            value={ref.name}
            onChange={e => setRef(idx, "name", e.target.value)}
            placeholder="Nome completo"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              className={inp}
              value={ref.phone}
              onChange={e => setRef(idx, "phone", e.target.value)}
              placeholder="(11) 99999-0000"
              type="tel"
            />
            <input
              className={inp}
              value={ref.email}
              onChange={e => setRef(idx, "email", e.target.value)}
              placeholder="email@exemplo.com"
              type="email"
            />
          </div>
        </div>
      ))}

      {value.length < 3 && (
        <button
          type="button"
          onClick={addRef}
          className="w-full flex items-center justify-center gap-2 border border-dashed border-white/20 rounded-xl py-2.5 text-white/40 text-sm hover:border-primary/40 hover:text-white/60 transition-all"
        >
          <Plus className="w-4 h-4" />
          Adicionar referência
        </button>
      )}
    </div>
  );
}
