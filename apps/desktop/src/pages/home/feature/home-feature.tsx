import { useQuery } from "@tanstack/react-query";
import { Screen } from "@/components/screen";
import { api } from "@/lib/api";
import { formatDuration, type FocusSession } from "@/lib/focus";

interface SessionsPayload {
  data: FocusSession[];
}

const STATUS_LABEL: Record<string, string> = {
  running: "In progress",
  paused: "Paused",
  completed: "Completed",
  abandoned: "Abandoned",
};

// deliberately bare-bones: this list only proves sessions are recorded —
// the real dashboard will replace it
export function HomeFeature() {
  const sessions = useQuery({
    queryKey: ["focus", "sessions"],
    queryFn: () =>
      api.get("/api/v1/focus/sessions", {}) as Promise<SessionsPayload>,
  });

  const rows = sessions.data?.data ?? [];

  return (
    <Screen className="justify-start pt-24">
      <div className="animate-in fade-in slide-in-from-bottom-2 flex w-full max-w-md flex-col gap-6 duration-500">
        <header className="flex flex-col items-center gap-1.5 text-center">
          <p className="text-muted-foreground text-xs font-medium tracking-[0.2em] uppercase">
            Atlas
          </p>
          <h1 className="text-xl font-semibold tracking-tight">
            Recent sessions
          </h1>
        </header>
        {sessions.isPending ? (
          <p className="text-muted-foreground animate-pulse text-center text-sm">
            Loading sessions…
          </p>
        ) : rows.length === 0 ? (
          <p className="text-muted-foreground text-center text-sm">
            No sessions yet. Start your first one from the top bar.
          </p>
        ) : (
          <ul className="flex flex-col gap-1">
            {rows.map((session) => (
              <li
                key={session.id}
                className="text-muted-foreground flex items-baseline justify-between gap-4 rounded-lg px-3 py-2 text-sm"
              >
                <span>
                  {session.startedAt
                    ? new Date(session.startedAt).toLocaleString()
                    : "—"}
                </span>
                <span className="text-foreground font-medium tabular-nums">
                  {formatDuration(
                    session.durationSeconds ?? session.activeSeconds,
                  )}
                </span>
                <span className="w-20 text-right text-xs">
                  {STATUS_LABEL[session.status] ?? session.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Screen>
  );
}
