import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { api } from "@/lib/api";
import {
  buildMonthGrid,
  localKey,
  monthKey,
  weekStartFor,
  type FocusSession,
} from "@/lib/focus";
import { CalendarHeader } from "@/pages/sessions/ui/calendar-header";
import { MonthGrid } from "@/pages/sessions/ui/month-grid";

export function SessionsFeature() {
  const { t, i18n } = useTranslation();
  // always the first of the viewed month
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const month = monthKey(cursor);

  // the ["focus"] invalidation on focus:completed (app-layout) refreshes
  // this live; staleTime keeps month paging cheap under the focus throttle
  const sessions = useQuery({
    queryKey: ["focus", "sessions", month],
    queryFn: () => api.get("/api/v1/focus/sessions", { query: { month } }),
    retry: false,
    staleTime: 60_000,
  });

  const weekStartsOn = weekStartFor(i18n.language);
  const weeks = useMemo(
    () => buildMonthGrid(cursor.getFullYear(), cursor.getMonth(), weekStartsOn),
    [cursor, weekStartsOn],
  );

  const list = useMemo(() => sessions.data?.data ?? [], [sessions.data]);
  const sessionsByDay = useMemo(() => {
    const map = new Map<string, FocusSession[]>();
    for (const session of list) {
      if (!session.startedAt) continue;
      const key = localKey(new Date(session.startedAt));
      const bucket = map.get(key);
      if (bucket) bucket.push(session);
      else map.set(key, [session]);
    }
    return map;
  }, [list]);

  return (
    <main className="bg-background min-h-svh px-6 pt-12 pb-8">
      <div className="animate-in fade-in slide-in-from-bottom-2 mx-auto w-full max-w-5xl duration-500">
        <h2 className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-wide uppercase">
          {t("sessions.heading")}
        </h2>
        <div className="bg-card overflow-hidden rounded-xl">
          <CalendarHeader
            cursor={cursor}
            onPrev={() =>
              setCursor(
                new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1),
              )
            }
            onNext={() =>
              setCursor(
                new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1),
              )
            }
            onToday={() => {
              const now = new Date();
              setCursor(new Date(now.getFullYear(), now.getMonth(), 1));
            }}
          />
          <MonthGrid
            weeks={weeks}
            month={cursor.getMonth()}
            todayKey={localKey(new Date())}
            sessionsByDay={sessionsByDay}
            error={sessions.isError}
          />
        </div>
      </div>
    </main>
  );
}
