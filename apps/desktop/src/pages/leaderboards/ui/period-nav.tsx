import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@atlas/ui/components/button";
import { currentLocale } from "@/i18n";
import { type LeaderboardPeriod } from "@/lib/focus";

interface PeriodNavProps {
  period: LeaderboardPeriod;
  anchorStart: Date;
  nextDisabled: boolean;
  onShift: (delta: 1 | -1) => void;
}

function label(period: LeaderboardPeriod, start: Date): string {
  const locale = currentLocale();
  if (period === "daily") {
    return start.toLocaleDateString(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }
  if (period === "monthly") {
    return start.toLocaleDateString(locale, { month: "long", year: "numeric" });
  }
  const end = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate() + 6,
  );
  const fmt = (d: Date) =>
    d.toLocaleDateString(locale, { day: "numeric", month: "short" });
  return `${fmt(start)} – ${fmt(end)}`;
}

export function PeriodNav({
  period,
  anchorStart,
  nextDisabled,
  onShift,
}: PeriodNavProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={t("leaderboards.previousPeriod")}
        onClick={() => onShift(-1)}
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
      </Button>
      {/* French dates come lowercase — fine mid-sentence, not as a label */}
      <span className="min-w-32 text-center text-[13px] font-medium capitalize">
        {label(period, anchorStart)}
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={t("leaderboards.nextPeriod")}
        disabled={nextDisabled}
        onClick={() => onShift(1)}
      >
        <ChevronRight aria-hidden="true" className="size-4" />
      </Button>
    </div>
  );
}
