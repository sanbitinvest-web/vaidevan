import { useState, useEffect, useRef, useCallback } from "react";
import { Star, Check } from "lucide-react";
import { useFavorites } from "../hooks/useFavorites";
import type { FavoritePlace } from "../hooks/useFavorites";

const _AC_BASE = ((import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, ""))
  ?? "/api";

interface Suggestion {
  label: string;
  lat: string;
  lon: string;
}

export interface SelectedPlace {
  label: string;
  lat: string;
  lon: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (place: SelectedPlace) => void;
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

interface PendingNickname {
  itemLabel: string;
  itemLat: string;
  itemLon: string;
  value: string;
}

export function AddressAutocomplete({ value, onChange, onSelect, placeholder, onKeyDown, className }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [pendingNickname, setPendingNickname] = useState<PendingNickname | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nicknameInputRef = useRef<HTMLInputElement>(null);
  const debouncedValue = useDebounce(value, 350);
  const { favorites, isFavorite, addFavorite, removeFavorite } = useFavorites();

  const q = debouncedValue.trim();

  const matchingFavorites: FavoritePlace[] = focused
    ? q.length < 3
      ? favorites
      : favorites.filter(f =>
          f.label.toLowerCase().includes(q.toLowerCase()) ||
          (f.nickname && f.nickname.toLowerCase().includes(q.toLowerCase()))
        )
    : [];

  useEffect(() => {
    if (q.length < 3) {
      setSuggestions([]);
      if (!focused) setOpen(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch(`${_AC_BASE}/maps/autocomplete?q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then((data: { results?: Suggestion[] }) => {
        if (cancelled) return;
        const results = (data.results ?? []).filter(
          r => !favorites.some(f => f.label === r.label)
        );
        setSuggestions(results);
        setActiveIndex(-1);
      })
      .catch(() => {
        if (!cancelled) setSuggestions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [debouncedValue, focused, favorites]);

  useEffect(() => {
    const hasItems = matchingFavorites.length > 0 || suggestions.length > 0;
    setOpen(focused && hasItems);
  }, [focused, matchingFavorites.length, suggestions.length]);

  // Auto-focus the nickname input when it appears
  useEffect(() => {
    if (pendingNickname !== null) {
      setTimeout(() => nicknameInputRef.current?.focus(), 0);
    }
  }, [pendingNickname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        // Cancel any pending nickname input rather than silently auto-committing
        setPendingNickname(null);
        setOpen(false);
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allItems: Array<{ item: Suggestion | FavoritePlace; isFav: boolean }> = [
    ...matchingFavorites.map(f => ({ item: f, isFav: true })),
    ...suggestions.map(s => ({ item: s, isFav: false })),
  ];

  const select = useCallback((s: Suggestion | FavoritePlace) => {
    onChange(s.label);
    onSelect?.({ label: s.label, lat: s.lat, lon: s.lon });
    setSuggestions([]);
    setOpen(false);
    setFocused(false);
    setActiveIndex(-1);
    setPendingNickname(null);
  }, [onChange, onSelect]);

  function commitNickname() {
    if (!pendingNickname) return;
    addFavorite({
      label: pendingNickname.itemLabel,
      lat: pendingNickname.itemLat,
      lon: pendingNickname.itemLon,
      nickname: pendingNickname.value.trim() || undefined,
    });
    setPendingNickname(null);
  }

  function handleStarClick(e: React.MouseEvent, item: Suggestion | FavoritePlace, isFav: boolean) {
    e.stopPropagation();
    if (isFav) {
      // Already a favorite — remove it; clear prompt if it was open for this item
      if (pendingNickname?.itemLabel === item.label) setPendingNickname(null);
      removeFavorite(item.label);
    } else if (pendingNickname?.itemLabel === item.label) {
      // Nickname prompt already open for this item — cancel it
      setPendingNickname(null);
    } else {
      // Not yet a favorite — open nickname prompt (keyed by stable label)
      setPendingNickname({
        itemLabel: item.label,
        itemLat: item.lat,
        itemLon: item.lon,
        value: "",
      });
    }
  }

  function handleNicknameKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      commitNickname();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setPendingNickname(null);
    }
    // Don't propagate to the main input handler
    e.stopPropagation();
  }

  function handleMainKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (open && allItems.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex(i => Math.min(i + 1, allItems.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, -1));
        return;
      }
      if (e.key === "Enter" && activeIndex >= 0 && activeIndex < allItems.length) {
        e.preventDefault();
        select(allItems[activeIndex].item);
        return;
      }
      if (e.key === "Escape") {
        if (pendingNickname) {
          setPendingNickname(null);
        } else {
          setOpen(false);
        }
        return;
      }
    }
    onKeyDown?.(e);
  }

  const favSectionEnd = matchingFavorites.length;

  return (
    <div ref={containerRef} className="relative flex-1">
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onKeyDown={handleMainKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        className={className}
      />
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-primary rounded-full animate-spin" />
        </div>
      )}
      {open && allItems.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 top-[calc(100%+4px)] bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl overflow-hidden">
          {favSectionEnd > 0 && (
            <li className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-white/30 select-none">
              Favoritos
            </li>
          )}
          {allItems.map(({ item, isFav }, i) => {
            const isActive = i === activeIndex;
            const showDivider = i === favSectionEnd && favSectionEnd > 0 && suggestions.length > 0;
            const isPending = pendingNickname?.itemLabel === item.label;
            const favItem = isFav ? (item as FavoritePlace) : null;
            const hasNickname = favItem?.nickname && favItem.nickname.trim().length > 0;

            return (
              <li key={`${isFav ? "fav" : "sug"}-${i}`}>
                {showDivider && (
                  <div className="mx-3 border-t border-white/10 my-1" />
                )}
                <div
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => !isPending && select(item)}
                  onMouseEnter={() => !isPending && setActiveIndex(i)}
                  className={`flex items-center gap-2 px-3 py-2.5 text-sm transition-colors group ${
                    isPending
                      ? "bg-primary/10 cursor-default"
                      : isActive
                        ? "bg-primary/20 text-primary cursor-pointer"
                        : "text-white/80 hover:bg-white/5 cursor-pointer"
                  }`}
                >
                  {isFav && (
                    <Star className="w-3.5 h-3.5 text-primary fill-primary flex-shrink-0" />
                  )}

                  {/* Address text: two-line if there's a nickname */}
                  <div className="flex-1 min-w-0">
                    {hasNickname ? (
                      <>
                        <div className="font-medium text-white truncate">{favItem!.nickname}</div>
                        <div className="text-[11px] text-white/40 truncate mt-0.5">{item.label}</div>
                      </>
                    ) : (
                      <span className="truncate block" title={item.label}>{item.label}</span>
                    )}
                  </div>

                  {/* Inline nickname input shown after starring */}
                  {isPending && (
                    <div
                      className="flex items-center gap-1 flex-shrink-0"
                      onMouseDown={e => e.stopPropagation()}
                      onClick={e => e.stopPropagation()}
                    >
                      <input
                        ref={nicknameInputRef}
                        type="text"
                        value={pendingNickname!.value}
                        onChange={e => setPendingNickname(p => p ? { ...p, value: e.target.value } : p)}
                        onKeyDown={handleNicknameKeyDown}
                        placeholder="Apelido (ex: Casa)"
                        maxLength={32}
                        className="w-32 text-xs bg-white/10 border border-white/20 rounded-md px-2 py-1 text-white placeholder-white/30 focus:outline-none focus:border-primary"
                      />
                      <button
                        onMouseDown={e => { e.stopPropagation(); e.preventDefault(); }}
                        onClick={e => { e.stopPropagation(); commitNickname(); }}
                        className="p-1 rounded-md bg-primary/20 hover:bg-primary/40 text-primary transition-colors"
                        title="Salvar favorito"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Star toggle button */}
                  <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => handleStarClick(e, item, isFav)}
                    className={`flex-shrink-0 p-0.5 rounded transition-opacity ${
                      isFav
                        ? "opacity-60 hover:opacity-100"
                        : isPending
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-60 hover:!opacity-100"
                    }`}
                    title={isFavorite(item.label) || isPending ? "Remover dos favoritos" : "Salvar nos favoritos"}
                  >
                    <Star
                      className={`w-3.5 h-3.5 transition-colors ${
                        isFavorite(item.label) || isPending
                          ? "text-primary fill-primary"
                          : "text-white/50 hover:text-primary"
                      }`}
                    />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
