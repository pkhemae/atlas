import { useTranslation } from "react-i18next";
import { Clock } from "lucide-react";
import type { Data } from "@atlas/api/data";
import { formatTotal, relativeDate } from "@/lib/focus";

// (named recent-session-card so a future sessions/ui/session-card can
// exist without collision)

const TOP_APPS = 4;

interface RecentSessionCardProps {
  session: Data.Focus.RecentSession;
  icons: Record<string, string | null>;
}

export function RecentSessionCard({ session, icons }: RecentSessionCardProps) {
  const { t } = useTranslation();
  // shares are of the summed app seconds, so the shown set reads as
  // fractions of the tracked time
  const total = session.apps.reduce((sum, app) => sum + app.seconds, 0);
  const topApps = session.apps.slice(0, TOP_APPS); // server pre-sorts desc

  return (
    <article className="bg-card rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="truncate text-sm font-semibold">{session.name}</h3>
        <span className="bg-foreground/[0.04] text-muted-foreground flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums">
          <Clock aria-hidden="true" className="size-3" />
          {formatTotal(session.durationSeconds)}
        </span>
      </div>

      {topApps.length > 0 && (
        <>
          <p className="text-muted-foreground/70 mt-3 text-[10px] font-semibold tracking-wider uppercase">
            {t("home.recent.appsLabel")}
          </p>
          <ul className="mt-1.5 space-y-1.5">
            {topApps.map((app) => {
              const pct =
                total > 0 ? Math.round((app.seconds / total) * 100) : 0;
              const icon = app.bundleId ? icons[app.bundleId] : null;
              return (
                <li
                  key={app.bundleId ?? app.name}
                  className="flex items-center gap-2"
                >
                  {icon ? (
                    <img
                      src={icon}
                      alt=""
                      className="size-5 shrink-0 rounded-[5px]"
                    />
                  ) : (
                    // fallback: neutral square carrying the app's initial
                    <span
                      aria-hidden="true"
                      className="bg-foreground/[0.06] text-muted-foreground flex size-5 shrink-0 items-center justify-center rounded-[5px] text-[10px] font-semibold uppercase"
                    >
                      {app.name[0]}
                    </span>
                  )}
                  <span className="w-28 shrink-0 truncate text-xs">
                    {app.name}
                  </span>
                  <div className="bg-foreground/[0.06] h-1 min-w-0 flex-1 overflow-hidden rounded-full">
                    {/* data-driven width = inline style, house rule */}
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-muted-foreground w-9 shrink-0 text-right text-[11px] tabular-nums">
                    {pct}%
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <p className="text-muted-foreground/70 mt-3 text-right text-[11px]">
        {relativeDate(session.startedAt)}
      </p>
    </article>
  );
}
