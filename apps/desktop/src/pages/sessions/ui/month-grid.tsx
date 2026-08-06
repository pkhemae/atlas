import { useTranslation } from "react-i18next";
import { currentLocale } from "@/i18n";
import { localKey, type FocusSession } from "@/lib/focus";
import { DayCell } from "@/pages/sessions/ui/day-cell";

interface MonthGridProps {
  weeks: Date[][];
  month: number;
  todayKey: string;
  sessionsByDay: Map<string, FocusSession[]>;
  loading: boolean;
  error: boolean;
  empty: boolean;
}

export function MonthGrid({
  weeks,
  month,
  todayKey,
  sessionsByDay,
  loading,
  error,
  empty,
}: MonthGridProps) {
  const { t } = useTranslation();

  const status = loading
    ? t("sessions.loading")
    : error
      ? t("sessions.error")
      : empty
        ? t("sessions.empty")
        : null;

  return (
    <section aria-label={t("sessions.ariaLabel")}>
      {status && (
        <p className="text-muted-foreground px-4 pt-3 text-xs font-medium">
          {status}
        </p>
      )}
      {loading ? (
        <div
          aria-hidden="true"
          className="bg-foreground/5 m-4 h-96 animate-pulse rounded-lg"
        />
      ) : error ? null : (
        <>
          {/* labels come from the actual first week, so they localize AND
              reorder with the week-start convention. No hairline of its
              own — the single line above the grid does the separating */}
          <div className="grid grid-cols-7">
            {weeks[0]?.map((day) => (
              <div
                key={day.getDay()}
                className="text-muted-foreground/70 px-2 pb-2 text-right text-[9px] font-medium tracking-[0.08em] uppercase"
              >
                {day.toLocaleDateString(currentLocale(), { weekday: "short" })}
              </div>
            ))}
          </div>
          {/* 1px gaps over a tinted backdrop draw the hairlines — the
              pt-px adds the line above the first row (no border-* here) */}
          <div className="bg-foreground/5 grid grid-cols-7 gap-px pt-px">
            {weeks.flat().map((day) => {
              const key = localKey(day);
              return (
                <DayCell
                  key={key}
                  date={day}
                  inMonth={day.getMonth() === month}
                  isToday={key === todayKey}
                  sessions={sessionsByDay.get(key) ?? []}
                />
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
