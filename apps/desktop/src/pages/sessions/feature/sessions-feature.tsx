import { useTranslation } from "react-i18next";
import { ComingSoon } from "@/components/coming-soon";

export function SessionsFeature() {
  const { t } = useTranslation();

  return (
    <ComingSoon
      eyebrow={t("sidebar.sessions")}
      copy={t("comingSoon.sessions")}
    />
  );
}
