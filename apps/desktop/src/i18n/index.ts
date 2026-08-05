import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { emitTo } from "@tauri-apps/api/event";
import en from "./locales/en";
import fr from "./locales/fr";

export const SUPPORTED_LANGUAGES = ["en", "fr"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

const STORAGE_KEY = "atlas.language";

function isLanguage(value: unknown): value is Language {
  return value === "en" || value === "fr";
}

function initialLanguage(): Language {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (isLanguage(stored)) return stored;
  return navigator.language.toLowerCase().startsWith("fr") ? "fr" : "en";
}

// module-level, synchronous: resources are bundled so every render — in
// both webviews, which share this entry — sees a ready instance. The
// guard covers Vite HMR re-evaluation.
if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources: { en: { translation: en }, fr: { translation: fr } },
    lng: initialLanguage(),
    fallbackLng: "en",
    supportedLngs: [...SUPPORTED_LANGUAGES],
    interpolation: { escapeValue: false },
  });

  i18n.on("languageChanged", (lng) => {
    document.documentElement.lang = lng;
    localStorage.setItem(STORAGE_KEY, lng);
  });
  document.documentElement.lang = i18n.language;
}

/** BCP 47 locale for Intl/toLocale* calls, mapped from the app language. */
export function currentLocale(): "en-US" | "fr-FR" {
  return i18n.language === "fr" ? "fr-FR" : "en-US";
}

/**
 * Changes the language and tells the dock webview (its own React root —
 * localStorage covers its next boot, the event covers it live).
 */
export async function setLanguage(lang: Language): Promise<void> {
  await i18n.changeLanguage(lang);
  await emitTo("dock", "i18n:changed", lang).catch(() => {});
}

export default i18n;
