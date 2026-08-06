import { cn } from "@atlas/ui/lib/utils";
import { type FocusSession } from "@/lib/focus";
import { SessionCard } from "@/pages/sessions/ui/session-card";

interface DayCellProps {
  date: Date;
  inMonth: boolean;
  isToday: boolean;
  sessions: FocusSession[];
}

// no max height on purpose: busy days grow their row and the page
// scrolls — nothing is ever truncated behind a "+N more"
export function DayCell({ date, inMonth, isToday, sessions }: DayCellProps) {
  return (
    <div
      className={cn(
        "flex min-h-24 flex-col gap-1 p-2",
        // cells must stay opaque over the hairline backdrop, so the
        // today wash blends primary into the card color itself
        isToday
          ? "bg-[color-mix(in_srgb,var(--primary)_5%,var(--card))]"
          : "bg-card",
      )}
    >
      <span
        className={cn(
          "self-end text-[11px] tabular-nums",
          isToday
            ? "bg-primary text-primary-foreground grid size-5 place-items-center rounded-full font-semibold"
            : inMonth
              ? "text-muted-foreground"
              : "text-muted-foreground/40",
        )}
      >
        {date.getDate()}
      </span>
      {sessions.map((session) => (
        <SessionCard key={session.id} session={session} />
      ))}
    </div>
  );
}
