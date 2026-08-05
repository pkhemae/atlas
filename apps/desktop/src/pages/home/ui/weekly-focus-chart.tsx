import { useId, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@atlas/ui/components/chart";
import {
  type ActivityDay,
  formatTotal,
  weekLabel,
  weeklyTotals,
} from "@/lib/focus";

interface WeeklyFocusChartProps {
  days: ActivityDay[];
  loading: boolean;
  error: boolean;
}

export function WeeklyFocusChart({
  days,
  loading,
  error,
}: WeeklyFocusChartProps) {
  const { t, i18n } = useTranslation();
  const gradientId = useId();
  // in render scope: the series label follows the active language
  const chartConfig = {
    focus: { label: t("home.weekly.seriesLabel"), color: "var(--chart-1)" },
  } satisfies ChartConfig;
  const data = useMemo(
    () =>
      weeklyTotals(days, new Date()).map(({ weekStart, totalSeconds }) => ({
        label: weekLabel(weekStart),
        totalSeconds,
      })),
    // i18n.language: weekLabel output is locale-dependent
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [days, i18n.language],
  );

  const thisWeekSeconds = data[data.length - 1]?.totalSeconds ?? 0;

  return (
    <section aria-label={t("home.weekly.ariaLabel")} className="p-4">
      <p className="text-xs font-medium">
        {loading
          ? t("home.weekly.loading")
          : error
            ? t("home.weekly.error")
            : thisWeekSeconds > 0
              ? t("home.weekly.total", {
                  duration: formatTotal(thisWeekSeconds),
                })
              : t("home.weekly.empty")}
      </p>
      {loading ? (
        <div className="bg-foreground/5 mt-3 h-28 animate-pulse rounded-lg" />
      ) : (
        <ChartContainer
          config={chartConfig}
          className="mt-3 aspect-auto h-28 w-full"
        >
          <AreaChart
            data={data}
            // side margins give the edge tick labels room to render —
            // grid and curve share the same plot box, ending together
            margin={{ top: 4, right: 14, bottom: 0, left: 14 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-focus)"
                  stopOpacity={0.25}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-focus)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              interval={1}
              tickMargin={6}
              tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
            />
            {/* 1h floor keeps an all-zero series flat at the baseline */}
            <YAxis hide domain={[0, (max: number) => Math.max(max, 3600)]} />
            <ChartTooltip
              cursor={{ stroke: "var(--border)" }}
              content={<WeeklyFocusTooltip />}
            />
            <Area
              dataKey="totalSeconds"
              type="monotone"
              stroke="var(--color-focus)"
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 3 }}
              animationDuration={800}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ChartContainer>
      )}
    </section>
  );
}

interface WeeklyFocusTooltipProps {
  active?: boolean;
  label?: string;
  payload?: { value?: number }[];
}

// same pill as the app's tooltips — dark in both themes, no arrow
function WeeklyFocusTooltip({
  active,
  label,
  payload,
}: WeeklyFocusTooltipProps) {
  const { t } = useTranslation();
  if (!active || !payload?.length) return null;
  const seconds = payload[0]?.value ?? 0;
  return (
    <div className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-50">
      {seconds > 0
        ? t("home.weekly.tooltipFocus", {
            duration: formatTotal(seconds),
            week: label ?? "",
          })
        : t("home.weekly.tooltipEmpty", { week: label ?? "" })}
    </div>
  );
}
