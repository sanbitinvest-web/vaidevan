import { useState, useCallback, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { AUTH_CHANGED } from "@/context/AuthContext";

const FAVORITES_KEY = "vv_favorite_addresses";
const FAVORITES_CHANGED = "vv-favorites-changed";
const TOKEN_KEY = "vdv_token";
// Tracks whether we already migrated localStorage to the server in this session
const MIGRATED_KEY = "vv_fav_migrated";

export interface FavoritePlace {
  label: string;
  lat: string;
  lon: string;
  nickname?: string;
}

function loadLocal(): FavoritePlace[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is FavoritePlace =>
        item && typeof item.label === "string" &&
        typeof item.lat === "string" &&
        typeof item.lon === "string"
    );
  } catch {
    return [];
  }
}

function saveLocal(favorites: FavoritePlace[]) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch {
  }
}

function broadcastChange() {
  window.dispatchEvent(new CustomEvent(FAVORITES_CHANGED));
}

function isLoggedIn(): boolean {
  return Boolean(localStorage.getItem(TOKEN_KEY));
}

function mergeFavorites(local: FavoritePlace[], remote: FavoritePlace[]): FavoritePlace[] {
  const localNicknameMap = new Map<string, string>();
  for (const f of local) {
    if (f.nickname) localNicknameMap.set(f.label, f.nickname);
  }

  const seen = new Set<string>();
  const merged: FavoritePlace[] = [];
  for (const f of [...remote, ...local]) {
    if (!seen.has(f.label)) {
      seen.add(f.label);
      const nickname = f.nickname ?? localNicknameMap.get(f.label);
      merged.push(nickname ? { ...f, nickname } : { ...f });
    }
  }
  return merged;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoritePlace[]>(loadLocal);
  const syncing = useRef(false);

  // ── Anonymous sync (always, for all users) ──────────────────────────────
  const syncAnon = useCallback(async () => {
    if (syncing.current) return;
    syncing.current = true;
    try {
      const remote = await api.anonFavorites();
      const local = loadLocal();

      // On first load: migrate localStorage favorites to the server
      const alreadyMigrated = sessionStorage.getItem(MIGRATED_KEY) === "1";
      if (!alreadyMigrated && local.length > 0) {
        const remoteLabels = new Set(remote.map(f => f.label));
        const localOnly = local.filter(f => !remoteLabels.has(f.label));
        if (localOnly.length > 0) {
          // Use bulk replace: server remote + localOnly
          const merged = mergeFavorites(local, remote);
          try {
            await api.replaceAnonFavorites(merged);
            // Only mark migrated after successful write so we retry on next load if it failed
            sessionStorage.setItem(MIGRATED_KEY, "1");
            saveLocal(merged);
            setFavorites(merged);
          } catch {
            // Migration failed — will retry on next load
            saveLocal(local);
            setFavorites(local);
          }
          return;
        }
        sessionStorage.setItem(MIGRATED_KEY, "1");
      } else if (!alreadyMigrated) {
        sessionStorage.setItem(MIGRATED_KEY, "1");
      }

      const merged = mergeFavorites(local, remote);
      saveLocal(merged);
      setFavorites(merged);
    } catch {
      // Server unavailable — keep using local
    } finally {
      syncing.current = false;
    }
  }, []);

  // ── Investor sync (authenticated users only) ──────────────────────────────
  const syncFromApi = useCallback(async () => {
    if (!isLoggedIn() || syncing.current) return;
    syncing.current = true;
    try {
      const remote = await api.favorites();
      const local = loadLocal();
      const merged = mergeFavorites(local, remote);
      saveLocal(merged);
      setFavorites(merged);

      // Push any local-only items to the server
      const remoteLabels = new Set(remote.map(f => f.label));
      const localOnly = local.filter(f => !remoteLabels.has(f.label));
      for (const f of localOnly) {
        api.addFavorite(f).catch(() => {});
      }
    } catch {
      // Server unavailable — keep using local
    } finally {
      syncing.current = false;
    }
  }, []);

  // Initial sync on mount — anon always runs; investor sync runs if logged in
  useEffect(() => {
    if (isLoggedIn()) {
      syncFromApi();
    } else {
      syncAnon();
    }
  }, [syncAnon, syncFromApi]);

  // Re-sync when auth state changes in the same tab
  useEffect(() => {
    function handleAuthChanged(e: Event) {
      const loggedIn = (e as CustomEvent<{ loggedIn: boolean }>).detail.loggedIn;
      if (loggedIn) {
        syncFromApi();
      } else {
        // Logged out — fall back to anon sync
        syncAnon();
      }
    }
    window.addEventListener(AUTH_CHANGED, handleAuthChanged);
    return () => window.removeEventListener(AUTH_CHANGED, handleAuthChanged);
  }, [syncFromApi, syncAnon]);

  // Re-sync when auth state changes in a different tab
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === TOKEN_KEY) {
        if (e.newValue) {
          syncFromApi();
        } else {
          syncAnon();
        }
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [syncFromApi, syncAnon]);

  // Listen for broadcasts from other hooks on the same tab
  useEffect(() => {
    const handler = () => setFavorites(loadLocal());
    window.addEventListener(FAVORITES_CHANGED, handler);
    return () => window.removeEventListener(FAVORITES_CHANGED, handler);
  }, []);

  const isFavorite = useCallback(
    (label: string) => favorites.some(f => f.label.trim() === label.trim()),
    [favorites]
  );

  const addFavorite = useCallback((place: FavoritePlace) => {
    setFavorites(prev => {
      if (prev.some(f => f.label === place.label)) return prev;
      const next = [place, ...prev];
      saveLocal(next);
      broadcastChange();
      if (isLoggedIn()) {
        api.addFavorite(place).catch(() => {});
      } else {
        api.addAnonFavorite(place).catch(() => {});
      }
      return next;
    });
  }, []);

  const removeFavorite = useCallback((label: string) => {
    setFavorites(prev => {
      const next = prev.filter(f => f.label !== label);
      saveLocal(next);
      broadcastChange();
      if (isLoggedIn()) {
        api.removeFavorite(label).catch(() => {});
      } else {
        api.removeAnonFavorite(label).catch(() => {});
      }
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((place: FavoritePlace) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.label === place.label);
      const next = exists
        ? prev.filter(f => f.label !== place.label)
        : [place, ...prev];
      saveLocal(next);
      broadcastChange();
      if (isLoggedIn()) {
        if (exists) {
          api.removeFavorite(place.label).catch(() => {});
        } else {
          api.addFavorite(place).catch(() => {});
        }
      } else {
        if (exists) {
          api.removeAnonFavorite(place.label).catch(() => {});
        } else {
          api.addAnonFavorite(place).catch(() => {});
        }
      }
      return next;
    });
  }, []);

  return { favorites, isFavorite, addFavorite, removeFavorite, toggleFavorite };
}
