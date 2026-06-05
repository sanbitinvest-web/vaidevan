import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

const LANGS = [
  { code: "pt", label: "PT", flag: "🇧🇷", full: "Português" },
  { code: "en", label: "EN", flag: "🇺🇸", full: "English" },
  { code: "es", label: "ES", flag: "🇪🇸", full: "Español" },
] as const;

interface Props {
  compact?: boolean;
}

export function LanguageSwitcher({ compact = false }: Props) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGS.find(l => l.code === i18n.language) ?? LANGS[0];

  function switchTo(code: string) {
    i18n.changeLanguage(code);
    document.documentElement.lang = code === "pt" ? "pt-BR" : code;
    setOpen(false);
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (compact) {
    return (
      <div className="flex items-center gap-0.5">
        {LANGS.map(l => (
          <button
            key={l.code}
            onClick={() => switchTo(l.code)}
            aria-label={`Mudar idioma para ${l.full}`}
            title={l.full}
            className={`px-2 py-1 rounded text-xs font-bold transition-all ${
              i18n.language === l.code
                ? "bg-primary text-black"
                : "text-white/50 hover:text-white"
            }`}
          >
            {l.flag} {l.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Idioma: ${current.full}`}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 text-xs font-bold text-white/70 hover:text-white hover:border-white/40 transition-all"
      >
        <span>{current.flag}</span>
        <span>{current.label}</span>
        <svg
          className={`w-3 h-3 opacity-50 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 12 12"
          fill="none"
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden shadow-xl z-50 min-w-[130px]"
        >
          {LANGS.map(l => (
            <button
              key={l.code}
              role="option"
              aria-selected={i18n.language === l.code}
              onClick={() => switchTo(l.code)}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-left transition-colors ${
                i18n.language === l.code
                  ? "bg-primary/15 text-primary"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="text-base">{l.flag}</span>
              <div>
                <div className="font-black">{l.label}</div>
                <div className="font-normal opacity-60 text-[10px]">{l.full}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
