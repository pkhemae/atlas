import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@atlas/ui/components/tooltip";
import { cn } from "@atlas/ui/lib/utils";
import { currentLocale } from "@/i18n";
import {
  ACTIVITY_WINDOW_MONTHS,
  type ActivityDay,
  buildWeeks,
  formatTotal,
  levelFor,
  localKey,
  monthLabels,
  totalSince,
} from "@/lib/focus";

interface ActivityGraphProps {
  days: ActivityDay[];
  loading: boolean;
  error: boolean;
}

// intensity ramp: none, <30min, <1h30, <3h, 3h+ — green like a
// contribution graph, deliberately apart from the app's red accent
const LEVEL_CLASSES = [
  "bg-foreground/[0.06]",
  "bg-green-950",
  "bg-green-800",
  "bg-green-600",
  "bg-green-400",
];

export function ActivityGraph({ days, loading, error }: ActivityGraphProps) {
  const { t } = useTranslation();
  const weeks = useMemo(() => buildWeeks(new Date()), []);
  // built in render so labels follow the language; Sunday-indexed rows
  const dayLabels = [
    "",
    t("home.activity.dayMon"),
    "",
    t("home.activity.dayWed"),
    "",
    t("home.activity.dayFri"),
    "",
  ];
  const totalsByDate = useMemo(
    () => new Map(days.map((day) => [day.date, day.totalSeconds])),
    [days],
  );
  // only count what the graph shows — the API returns the full history
  const firstShownDate = weeks[0]?.[0];
  const totalSeconds = useMemo(
    () => totalSince(days, firstShownDate ? localKey(firstShownDate) : ""),
    [days, firstShownDate],
  );

  return (
    <section aria-label={t("home.activity.ariaLabel")} className="p-4">
      <p className="text-xs font-medium">
        {loading
          ? t("home.activity.loading")
          : error
            ? t("home.activity.error")
            : totalSeconds > 0
              ? t("home.activity.total", {
                  duration: formatTotal(totalSeconds),
                  months: ACTIVITY_WINDOW_MONTHS,
                })
              : t("home.activity.empty", { months: ACTIVITY_WINDOW_MONTHS })}
      </p>
      {loading ? (
        <div className="bg-foreground/5 mt-3 h-24 animate-pulse rounded-lg" />
      ) : (
        <div className="mt-3">
          <div className="relative ml-7 h-4">
            {monthLabels(weeks).map(({ index, label }) => (
              <span
                key={index}
                style={{ left: `${(index / weeks.length) * 100}%` }}
                className="text-muted-foreground absolute top-0 text-[10px]"
              >
                {label}
              </span>
            ))}
          </div>
          {/* fluid columns: the grid always fills the card, never scrolls */}
          <div className="flex gap-[3px]">
            <div className="mr-1 grid w-6 grid-rows-7 gap-[3px]">
              {dayLabels.map((label, index) => (
                <span
                  key={index}
                  className="text-muted-foreground flex items-center justify-end text-[9px] leading-none"
                >
                  {label}
                </span>
              ))}
            </div>
            <TooltipProvider delayDuration={150}>
              {weeks.map((week, weekIndex) => (
                <div
                  key={weekIndex}
                  className="grid flex-1 grid-rows-7 gap-[3px]"
                >
                  {week.map((day) => {
                    const key = localKey(day);
                    const seconds = totalsByDate.get(key) ?? 0;
                    const dateLabel = day.toLocaleDateString(currentLocale(), {
                      month: "short",
                      day: "numeric",
                    });
                    return (
                      <Tooltip key={key}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "aspect-square w-full rounded-[3px]",
                              LEVEL_CLASSES[levelFor(seconds)],
                            )}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          {seconds > 0
                            ? t("home.activity.dayTooltip", {
                                duration: formatTotal(seconds),
                                date: dateLabel,
                              })
                            : t("home.activity.dayTooltipEmpty", {
                                date: dateLabel,
                              })}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </TooltipProvider>
          </div>
          <div className="text-muted-foreground mt-3 flex items-center justify-end gap-1 text-[10px]">
            <span className="mr-1">{t("home.activity.less")}</span>
            {LEVEL_CLASSES.map((levelClass) => (
              <span
                key={levelClass}
                aria-hidden="true"
                className={cn("size-2.5 rounded-[3px]", levelClass)}
              />
            ))}
            <span className="ml-1">{t("home.activity.more")}</span>
          </div>
        </div>
      )}
    </section>
  );
}
