import { useSyncExternalStore } from "react";
import { emitTo } from "@tauri-apps/api/event";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";

export const THEMES = ["atlas", "midnight", "daylight"] as const;
export type ThemeId = (typeof THEMES)[number];

interface ThemeMeta {
  /** Whether the Tailwind `dark` class (dark: variants) applies. */
  dark: boolean;
  /** Native window background — kills wrong-color rubber-banding. */
  background: [number, number, number];
}

const THEME_META: Record<ThemeId, ThemeMeta> = {
  atlas: { dark: true, background: [27, 27, 28] },
  midnight: { dark: true, background: [16, 20, 24] },
  daylight: { dark: false, background: [246, 246, 247] },
};

export const DEFAULT_THEME: ThemeId = "atlas";
const STORAGE_KEY = "atlas.theme";

// the dock window is transparent — never paint a native background there
const isDockWindow =
  new URLSearchParams(window.location.search).get("window") === "dock";

function isTheme(value: unknown): value is ThemeId {
  return (THEMES as readonly string[]).includes(value as string);
}

function initialTheme(): ThemeId {
  const stored = localStorage.getItem(STORAGE_KEY);
  return isTheme(stored) ? stored : DEFAULT_THEME;
}

const listeners = new Set<() => void>();
let current: ThemeId = initialTheme();

function applyTheme(theme: ThemeId) {
  current = theme;
  const meta = THEME_META[theme];
  document.documentElement.dataset.theme = theme;
  document.documentElement.classList.toggle("dark", meta.dark);
  localStorage.setItem(STORAGE_KEY, theme);
  if (!isDockWindow) {
    void getCurrentWebviewWindow()
      .setBackgroundColor(meta.background)
      .catch(() => {});
  }
  listeners.forEach((listener) => listener());
}

// module-level, idempotent: both webviews share this entry, so the stored
// theme is on <html> before the first paint of any component
applyTheme(current);

/**
 * Changes the theme and tells the dock webview (its own React root —
 * localStorage covers its next boot, the event covers it live).
 */
export function setTheme(theme: ThemeId): void {
  applyTheme(theme);
  void emitTo("dock", "theme:changed", theme).catch(() => {});
}

/** Applies a theme locally without re-emitting (dock event handler). */
export function applyThemeLocally(theme: ThemeId): void {
  if (isTheme(theme)) applyTheme(theme);
}

export function useTheme(): { theme: ThemeId; setTheme: typeof setTheme } {
  const theme = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => current,
  );
  return { theme, setTheme };
}
