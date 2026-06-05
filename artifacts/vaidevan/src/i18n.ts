import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

const urlLang = new URLSearchParams(window.location.search).get("lang");
const supportedLangs = ["pt", "en", "es"];
const initialLng = supportedLangs.includes(urlLang ?? "") ? (urlLang as string) : undefined;

if (initialLng) {
  localStorage.setItem("vv_lang", initialLng);
  const url = new URL(window.location.href);
  url.searchParams.delete("lang");
  window.history.replaceState({}, "", url.toString());
}

const base = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: initialLng,
    fallbackLng: "pt",
    supportedLngs: supportedLangs,
    backend: {
      loadPath: `${base}/locales/{{lng}}.json`,
    },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "vv_lang",
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

export default i18n;
