import { useTranslation } from "react-i18next";
import type { Language } from "@/i18n";
import { THEMES, type ThemeId } from "@/theme";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@atlas/ui/components/select";

interface SettingsPageProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
  theme: ThemeId;
  onThemeChange: (theme: ThemeId) => void;
}

const THEME_LABEL_KEYS = {
  atlas: "settings.themeAtlas",
  midnight: "settings.themeMidnight",
  daylight: "settings.themeDaylight",
} as const satisfies Record<ThemeId, string>;

export function SettingsPage({
  language,
  onLanguageChange,
  theme,
  onThemeChange,
}: SettingsPageProps) {
  const { t } = useTranslation();

  return (
    <main className="min-h-svh px-6 pt-12 pb-8">
      <div className="animate-in fade-in slide-in-from-bottom-2 mx-auto w-full max-w-2xl duration-500">
        <h2 className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-wide uppercase">
          {t("settings.general")}
        </h2>
        <div className="bg-card rounded-xl">
          <div className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="text-sm font-medium">{t("settings.language")}</p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                {t("settings.languageHint")}
              </p>
            </div>
            <Select
              value={language}
              onValueChange={(value) => onLanguageChange(value as Language)}
            >
              <SelectTrigger size="sm" className="w-36 shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="end">
                <SelectItem value="en">{t("settings.english")}</SelectItem>
                <SelectItem value="fr">{t("settings.french")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div aria-hidden="true" className="bg-foreground/5 mx-4 h-px" />
          <div className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="text-sm font-medium">{t("settings.theme")}</p>
              <p className="text-muted-foreground mt-0.5 text-xs">
                {t("settings.themeHint")}
              </p>
            </div>
            <Select
              value={theme}
              onValueChange={(value) => onThemeChange(value as ThemeId)}
            >
              <SelectTrigger size="sm" className="w-36 shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="end">
                {THEMES.map((id) => (
                  <SelectItem key={id} value={id}>
                    <ThemeSwatch theme={id} />
                    {t(THEME_LABEL_KEYS[id])}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </main>
  );
}

/**
 * Real-color preview: the chip carries the theme's own data-theme
 * attribute, so its tokens (surface, ink, accent) resolve from the
 * actual CSS blocks — nothing to keep in sync.
 */
function ThemeSwatch({ theme }: { theme: ThemeId }) {
  return (
    <span
      data-theme={theme}
      aria-hidden="true"
      className="bg-background text-foreground relative flex size-6 shrink-0 items-center justify-center rounded-md text-[10px] font-semibold shadow-[inset_0_0_0_1px_var(--surface-ring)]"
    >
      Aa
      <span className="bg-primary absolute right-0.5 bottom-0.5 size-1.5 rounded-full" />
    </span>
  );
}
