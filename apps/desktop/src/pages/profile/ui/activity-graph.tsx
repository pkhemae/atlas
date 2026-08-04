import { useMemo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@atlas/ui/components/tooltip";
import { cn } from "@atlas/ui/lib/utils";

export interface ActivityDay {
  date: string;
  totalSeconds: number;
}

interface ActivityGraphProps {
  days: ActivityDay[];
  loading: boolean;
}

// intensity ramp: none, <30min, <1h30, <3h, 3h+
const LEVEL_CLASSES = [
  "bg-foreground/[0.06]",
  "bg-primary/25",
  "bg-primary/45",
  "bg-primary/70",
  "bg-primary",
];

const MONTHS = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

export function ActivityGraph({ days, loading }: ActivityGraphProps) {
  const weeks = useMemo(() => buildWeeks(new Date()), []);
  const totalsByDate = useMemo(
    () => new Map(days.map((day) => [day.date, day.totalSeconds])),
    [days],
  );
  // only count what the graph shows — the API returns the full history
  const firstShownDate = weeks[0]?.[0];
  const totalSeconds = useMemo(() => {
    const firstKey = firstShownDate ? localKey(firstShownDate) : "";
    return days
      .filter((day) => day.date >= firstKey)
      .reduce((sum, day) => sum + day.totalSeconds, 0);
  }, [days, firstShownDate]);

  return (
    <section
      aria-label="Activity"
      className="bg-card min-w-0 flex-1 rounded-xl p-5"
    >
      <h2 className="text-sm font-medium">
        {loading
          ? "Loading your activity…"
          : totalSeconds > 0
            ? `${formatTotal(totalSeconds)} of focus in the last 6 months`
            : "No focus time in the last 6 months yet"}
      </h2>
      {loading ? (
        <div className="bg-foreground/5 mt-4 h-28 animate-pulse rounded-lg" />
      ) : (
        <div className="mt-4">
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

/**
 * Sunday-started weeks covering the last 6 months, GitHub-style:
 * full first week, last one cut at today.
 */
function buildWeeks(now: Date): Date[][] {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(today);
  start.setMonth(start.getMonth() - 6);
  start.setDate(start.getDate() + 1);
  start.setDate(start.getDate() - start.getDay());

  const weeks: Date[][] = [];
  let current: Date[] = [];
  for (const d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
    const day = new Date(d);
    if (day.getDay() === 0 && current.length > 0) {
      weeks.push(current);
      current = [];
    }
    current.push(day);
  }
  if (current.length > 0) weeks.push(current);
  return weeks;
}

function monthLabels(weeks: Date[][]) {
  const labels: { index: number; label: string }[] = [];
  weeks.forEach((week, index) => {
    const first = week[0];
    if (!first) return;
    const month = first.getMonth();
    if (month !== weeks[index - 1]?.[0]?.getMonth()) {
      labels.push({ index, label: MONTHS[month] ?? "" });
    }
  });
  // a label hugging the left edge gets overlapped by the next one — drop it
  const [first, second] = labels;
  if (first && second && second.index - first.index < 3) {
    labels.shift();
  }
  return labels;
}

/** Local calendar date key, matching the API's per-day buckets. */
function localKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function levelFor(seconds: number): number {
  if (seconds <= 0) return 0;
  if (seconds < 30 * 60) return 1;
  if (seconds < 90 * 60) return 2;
  if (seconds < 180 * 60) return 3;
  return 4;
}

function formatTotal(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);
  if (hours > 0) return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
  if (minutes > 0) return `${minutes}min`;
  return `${totalSeconds}s`;
}
