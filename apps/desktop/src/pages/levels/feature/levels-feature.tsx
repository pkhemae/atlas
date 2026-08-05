import { useTranslation } from "react-i18next";
import { ComingSoon } from "@/components/coming-soon";

export function LevelsFeature() {
  const { t } = useTranslation();

  return (
    <ComingSoon eyebrow={t("sidebar.levels")} copy={t("comingSoon.levels")} />
  );
}
