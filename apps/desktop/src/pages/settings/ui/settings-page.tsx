import { useTranslation } from "react-i18next";
import type { Language } from "@/i18n";
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
}

export function SettingsPage({
  language,
  onLanguageChange,
}: SettingsPageProps) {
  const { t } = useTranslation();

  return (
    <main className="bg-background min-h-svh px-6 pt-12 pb-8">
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
        </div>
      </div>
    </main>
  );
}
