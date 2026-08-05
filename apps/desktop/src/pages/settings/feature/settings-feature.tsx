import { useTranslation } from "react-i18next";
import { setLanguage, type Language } from "@/i18n";
import { SettingsPage } from "@/pages/settings/ui/settings-page";

export function SettingsFeature() {
  const { i18n } = useTranslation();

  return (
    <SettingsPage
      language={(i18n.resolvedLanguage as Language) ?? "en"}
      onLanguageChange={(lang) => void setLanguage(lang)}
    />
  );
}
