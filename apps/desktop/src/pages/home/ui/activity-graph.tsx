import { useMemo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@atlas/ui/components/tooltip";
import { cn } from "@atlas/ui/lib/utils";
import {
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

const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

export function ActivityGraph({ days, loading, error }: ActivityGraphProps) {
  const weeks = useMemo(() => buildWeeks(new Date()), []);
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
    <section aria-label="Activity" className="p-4">
      <p className="text-xs font-medium">
        {loading
          ? "Loading your activity…"
          : error
            ? "Couldn't load your activity."
            : totalSeconds > 0
              ? `${formatTotal(totalSeconds)} of focus in the last 6 months`
              : "No focus time in the last 6 months yet"}
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
              {DAY_LABELS.map((label, index) => (
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
                    const dateLabel = day.toLocaleDateString("en-US", {
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
                            ? `${formatTotal(seconds)} of focus · ${dateLabel}`
                            : `No session · ${dateLabel}`}
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </TooltipProvider>
          </div>
          <div className="text-muted-foreground mt-3 flex items-center justify-end gap-1 text-[10px]">
            <span className="mr-1">Less</span>
            {LEVEL_CLASSES.map((levelClass) => (
              <span
                key={levelClass}
                aria-hidden="true"
                className={cn("size-2.5 rounded-[3px]", levelClass)}
              />
            ))}
            <span className="ml-1">More</span>
          </div>
        </div>
      )}
    </section>
  );
}
