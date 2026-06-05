import { useState, useCallback, useRef } from "react";

export type GeoCoords = {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
};

export type GeoState =
  | { status: "idle" }
  | { status: "requesting" }
  | { status: "granted"; coords: GeoCoords }
  | { status: "denied"; message: string }
  | { status: "error"; message: string };

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({ status: "idle" });
  const watchIdRef = useRef<number | null>(null);

  const requestOnce = useCallback((): Promise<GeoCoords> => {
    setState({ status: "requesting" });
    return new Promise((resolve, reject) => {
      if (!("geolocation" in navigator)) {
        const msg = "Geolocalização não suportada neste dispositivo.";
        setState({ status: "error", message: msg });
        reject(new Error(msg));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: GeoCoords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp,
          };
          setState({ status: "granted", coords });
          resolve(coords);
        },
        (err) => {
          const msg =
            err.code === 1
              ? "Permissão de localização negada. Ative nas configurações do browser."
              : err.code === 2
              ? "Posição indisponível. Verifique o GPS."
              : "Timeout ao obter localização.";
          setState({ status: err.code === 1 ? "denied" : "error", message: msg });
          reject(new Error(msg));
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    });
  }, []);

  const startWatch = useCallback((onUpdate: (c: GeoCoords) => void) => {
    if (!("geolocation" in navigator)) return;
    setState({ status: "requesting" });
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coords: GeoCoords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          timestamp: pos.timestamp,
        };
        setState({ status: "granted", coords });
        onUpdate(coords);
      },
      (err) => {
        const msg = err.code === 1 ? "Localização negada." : "Erro de GPS.";
        setState({ status: err.code === 1 ? "denied" : "error", message: msg });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );
  }, []);

  const stopWatch = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  return { state, requestOnce, startWatch, stopWatch };
}

export function formatCoords(lat: number, lng: number) {
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "O";
  return `${Math.abs(lat).toFixed(6)}°${latDir}, ${Math.abs(lng).toFixed(6)}°${lngDir}`;
}
