import { useTranslation } from "react-i18next";
import { cn } from "@atlas/ui/lib/utils";
import { formatTotal, type FocusSession } from "@/lib/focus";

interface SessionCardProps {
  session: FocusSession;
}

// already a real button: the future details/rename modal only needs an
// onSelect prop threaded down — no markup churn
export function SessionCard({ session }: SessionCardProps) {
  const { t } = useTranslation();
  const abandoned = session.status === "abandoned";
  const duration = formatTotal(session.durationSeconds ?? 0);

  return (
    <button
      type="button"
      aria-label={t(
        abandoned ? "sessions.abandonedSession" : "sessions.sessionLabel",
        { name: session.name, duration },
      )}
      className={cn(
        "w-full rounded-[5px] bg-foreground/[0.04] px-1.5 py-1 text-left transition-colors outline-none",
        "hover:bg-foreground/5 focus-visible:ring-ring/50 focus-visible:ring-2",
        abandoned && "opacity-60",
      )}
    >
      <span
        className={cn(
          "block truncate text-[11px] leading-tight font-medium",
          abandoned && "text-muted-foreground",
        )}
      >
        {session.name}
      </span>
      <span className="text-muted-foreground block text-[10px] tabular-nums">
        {duration}
      </span>
    </button>
  );
}
