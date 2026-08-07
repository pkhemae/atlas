import { useQuery } from "@tanstack/react-query";
import { Navigate, useParams } from "@tanstack/react-router";
import { api } from "@/lib/api";
import { extractApiErrorCode } from "@/lib/api-errors";
import { memberSince } from "@/lib/focus";
import { useMe } from "@/app/use-me";
import { UserProfile } from "@/pages/user-profile/ui/user-profile";

export function UserProfileFeature() {
  const { username } = useParams({ from: "/u/$username" });
  const me = useMe();

  const profile = useQuery({
    // user-scoped keys, deliberately NOT under ["focus"] — that prefix is
    // the viewer's own data and refetches on focus:completed
    queryKey: ["users", "profile", username],
    queryFn: () => api.get("/api/v1/users/:username", { params: { username } }),
    retry: false,
  });

  // your own public page is just a poorer home — go there instead
  if (me.data?.username && me.data.username === username.toLowerCase()) {
    return <Navigate to="/" />;
  }

  const notFound =
    profile.isError &&
    extractApiErrorCode(profile.error) === "E_USER_NOT_FOUND";
  const data = profile.data?.data ?? null;

  return (
    <UserProfile
      profile={
        data
          ? {
              fullName: data.user.name,
              handle: data.user.username ?? "",
              initials: data.user.initials,
              bio: data.user.bio,
              location: data.user.location,
              avatarUrl: data.user.avatarUrl,
              bannerUrl: data.user.bannerUrl,
              memberSince: memberSince(data.user.createdAt),
              progression: {
                tier: data.progression.level.tier,
                division: data.progression.level.division,
                next: data.progression.nextLevel
                  ? {
                      tier: data.progression.nextLevel.tier,
                      division: data.progression.nextLevel.division,
                    }
                  : null,
                xpIntoLevel: data.progression.xpIntoLevel,
                xpForLevel: data.progression.xpForLevel,
                streakDays: data.progression.streakDays,
              },
              weeklyRank: data.weeklyRank,
            }
          : null
      }
      days={data?.activity ?? []}
      loading={profile.isPending}
      error={profile.isError && !notFound}
      notFound={notFound}
    />
  );
}
