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
        "relative w-full rounded-md bg-foreground/[0.05] py-1.5 pr-2 text-left transition-colors outline-none",
        "hover:bg-foreground/[0.08] focus-visible:ring-ring/50 focus-visible:ring-2",
        abandoned
          ? "pl-2 opacity-60"
          : // the same gradient bar that marks the active sidebar tab —
            // one accent, theme-aware through the token
            "pl-3 before:absolute before:top-1.5 before:bottom-1.5 before:left-1.5 before:w-0.5 before:rounded-full before:bg-[image:var(--nav-active-bar)]",
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
      <span className="text-muted-foreground/70 mt-0.5 block text-[10px] tabular-nums">
        {duration}
      </span>
    </button>
  );
}
