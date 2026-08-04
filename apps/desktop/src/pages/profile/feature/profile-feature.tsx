import { useQuery } from "@tanstack/react-query";
import { api, type AuthUser } from "@/lib/api";
import {
  ActivityGraph,
  type ActivityDay,
} from "@/pages/profile/ui/activity-graph";
import { ProfileCard } from "@/pages/profile/ui/profile-card";

interface ActivityResponse {
  data: ActivityDay[];
}

export function ProfileFeature() {
  const me = useQuery({
    queryKey: ["me"],
    queryFn: () => api.get("/api/v1/auth/me", {}) as Promise<AuthUser>,
    retry: false,
  });

  const activity = useQuery({
    queryKey: ["focus", "activity"],
    queryFn: () =>
      api.get("/api/v1/focus/activity", {}) as Promise<ActivityResponse>,
  });

  return (
    <main className="bg-background min-h-svh px-6 pt-16 pb-8">
      <div className="animate-in fade-in slide-in-from-bottom-2 mx-auto flex w-full max-w-4xl items-start gap-4 duration-500">
        {me.data ? (
          <ProfileCard
            fullName={me.data.fullName ?? me.data.email}
            handle={me.data.email.split("@")[0] ?? me.data.email}
            email={me.data.email}
            initials={me.data.initials}
            memberSince={memberSince(me.data.createdAt)}
          />
        ) : (
          <div className="bg-card h-[520px] w-80 shrink-0 animate-pulse rounded-xl" />
        )}
        <ActivityGraph
          days={activity.data?.data ?? []}
          loading={activity.isPending}
        />
      </div>
    </main>
  );
}

function memberSince(createdAt: string | null): string | null {
  const parsed = createdAt ? new Date(createdAt) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}
