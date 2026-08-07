import { useTranslation } from "react-i18next";
import type { Data } from "@atlas/api/data";
import { RecentSessionCard } from "@/pages/home/ui/recent-session-card";

interface RecentSessionsProps {
  sessions: Data.Focus.RecentSession[];
  icons: Record<string, string | null>;
  loading: boolean;
  error: boolean;
}

export function RecentSessions({
  sessions,
  icons,
  loading,
  error,
}: RecentSessionsProps) {
  const { t } = useTranslation();

  if (error) {
    return (
      <p className="text-muted-foreground text-xs font-medium">
        {t("home.recent.error")}
      </p>
    );
  }
  if (loading) return null; // no skeleton — the feed pops in when loaded
  if (sessions.length === 0) {
    return (
      <p className="text-muted-foreground text-xs font-medium">
        {t("home.recent.empty")}
      </p>
    );
  }

  return (
    <section
      aria-label={t("home.recent.ariaLabel")}
      className="flex flex-col gap-3"
    >
      {sessions.map((session) => (
        <RecentSessionCard key={session.id} session={session} icons={icons} />
      ))}
    </section>
  );
}
