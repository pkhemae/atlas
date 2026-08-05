import { useState } from "react";
import { SettingsPage, type Language } from "@/pages/settings/ui/settings-page";

export function SettingsFeature() {
  // UI only for now — the real i18n wiring (persistence + translation
  // loading) comes with the i18n feature
  const [language, setLanguage] = useState<Language>("en");

  return <SettingsPage language={language} onLanguageChange={setLanguage} />;
}
