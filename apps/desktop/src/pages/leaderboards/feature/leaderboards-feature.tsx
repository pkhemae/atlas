import { useTranslation } from "react-i18next";
import { ComingSoon } from "@/components/coming-soon";

export function LeaderboardsFeature() {
  const { t } = useTranslation();

  return (
    <ComingSoon
      eyebrow={t("sidebar.leaderboards")}
      copy={t("comingSoon.leaderboards")}
    />
  );
}
