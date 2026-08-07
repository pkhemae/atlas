import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { appIcon } from "@/lib/app-icons";
import {
  extractApiErrorMessage,
  extractApiFieldErrors,
} from "@/lib/api-errors";
import { localKey, memberSince, periodStart } from "@/lib/focus";
import { useMe } from "@/app/use-me";
import { ActivityGraph } from "@/pages/home/ui/activity-graph";
import { WeeklyFocusChart } from "@/pages/home/ui/weekly-focus-chart";
import {
  EditProfileModal,
  type EditProfileFormState,
} from "@/pages/home/ui/edit-profile-modal";
import { DeleteSessionDialog } from "@/pages/home/ui/delete-session-dialog";
import { ProfileCard } from "@/pages/home/ui/profile-card";
import { RecentSessions } from "@/pages/home/ui/recent-sessions";
import { RenameSessionModal } from "@/pages/home/ui/rename-session-modal";

export function HomeFeature() {
  const { t } = useTranslation();
  const me = useMe();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(
    null,
  );
  const [deleting, setDeleting] = useState<{ id: string; name: string } | null>(
    null,
  );

  const activity = useQuery({
    queryKey: ["focus", "activity"],
    queryFn: () => api.get("/api/v1/focus/activity", {}),
    retry: false,
  });

  // refreshed by the ["focus"] invalidation when a session completes
  const progression = useQuery({
    queryKey: ["focus", "progression"],
    queryFn: () => api.get("/api/v1/focus/progression", {}),
    retry: false,
  });
  const snapshot = progression.data?.data ?? null;

  // the card's rank = this week's leaderboard position; the key matches
  // the leaderboards page's default view, so the cache is shared
  const weekKey = localKey(periodStart("weekly", new Date()));
  const weeklyBoard = useQuery({
    queryKey: ["focus", "leaderboard", "weekly", weekKey],
    queryFn: () =>
      api.get("/api/v1/focus/leaderboard", {
        query: { period: "weekly", anchor: weekKey },
      }),
    retry: false,
  });

  // refreshed by the ["focus"] invalidation when a session completes
  const recent = useQuery({
    queryKey: ["focus", "sessions", "recent"],
    queryFn: () => api.get("/api/v1/focus/sessions/recent", {}),
    retry: false,
  });

  // icons resolve locally through the Rust command (ui/ stays pure);
  // the lib cache makes re-resolution free
  const bundleIds = useMemo(
    () =>
      [
        ...new Set(
          (recent.data?.data ?? []).flatMap((session) =>
            session.apps.flatMap((app) => (app.bundleId ? [app.bundleId] : [])),
          ),
        ),
      ].sort(),
    [recent.data],
  );
  const icons = useQuery({
    queryKey: ["app-icons", bundleIds],
    enabled: bundleIds.length > 0,
    staleTime: Infinity,
    queryFn: async () =>
      Object.fromEntries(
        await Promise.all(
          bundleIds.map(async (id) => [id, await appIcon(id)] as const),
        ),
      ) as Record<string, string | null>,
  });

  const renameSession = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      api.patch("/api/v1/focus/sessions/:id", {
        params: { id },
        body: { name },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["focus"] });
      setRenaming(null);
    },
  });

  const deleteSession = useMutation({
    mutationFn: (id: string) =>
      api.delete("/api/v1/focus/sessions/:id", { params: { id } }),
    onSuccess: () => {
      // deletion ripples through everything derived: activity, XP,
      // rankings — the whole ["focus"] prefix refetches
      queryClient.invalidateQueries({ queryKey: ["focus"] });
      setDeleting(null);
    },
  });

  // API contract: absent key = untouched, File = replace, null = remove
  // (tuyau serializes null as an empty field and switches to multipart
  // on its own when the body holds a File)
  const updateProfile = useMutation({
    mutationFn: (state: EditProfileFormState) => {
      const body = {
        // "" would linger in the DB while null is the real "no name"
        fullName: state.fullName || null,
        username: state.username,
        bio: state.bio,
        location: state.location,
        ...(state.avatar
          ? { avatar: state.avatar }
          : state.removeAvatar
            ? { avatar: null }
            : {}),
        ...(state.banner ? { banner: state.banner } : {}),
      };
      // body cast: the registry types file fields as server-side
      // MultipartFile — the client legitimately sends File/null
      return api.patch("/api/v1/auth/me", { body: body as never });
    },
    onSuccess: (user) => {
      // one cache entry feeds the card, the modal and the navbar menu
      queryClient.setQueryData(["me"], user);
      setEditing(false);
    },
  });

  const openEditor = () => {
    updateProfile.reset();
    setEditing(true);
  };

  const fieldErrors = updateProfile.isError
    ? extractApiFieldErrors(updateProfile.error)
    : {};

  return (
    <main className="min-h-svh px-6 pt-12 pb-8">
      <div className="animate-in fade-in slide-in-from-bottom-2 mx-auto flex w-full max-w-2xl items-start gap-8 duration-500">
        {/* the page scrolls with the sessions feed — the card stays put,
            top-12 clearing the fixed drag strip */}
        <div className="sticky top-12 shrink-0 self-start">
          {me.data ? (
            <ProfileCard
              fullName={me.data.fullName ?? me.data.email}
              handle={me.data.username ?? me.data.email.split("@")[0] ?? ""}
              initials={me.data.initials}
              bio={me.data.bio}
              location={me.data.location}
              avatarUrl={me.data.avatarUrl}
              bannerUrl={me.data.bannerUrl}
              memberSince={memberSince(me.data.createdAt)}
              progression={
                snapshot
                  ? {
                      tier: snapshot.level.tier,
                      division: snapshot.level.division,
                      next: snapshot.nextLevel
                        ? {
                            tier: snapshot.nextLevel.tier,
                            division: snapshot.nextLevel.division,
                          }
                        : null,
                      xpIntoLevel: snapshot.xpIntoLevel,
                      xpForLevel: snapshot.xpForLevel,
                      streakDays: snapshot.streakDays,
                    }
                  : null
              }
              weeklyRank={weeklyBoard.data?.data.me?.rank ?? null}
              onEditProfile={openEditor}
            />
          ) : (
            <div className="bg-card h-96 w-60 animate-pulse rounded-xl" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-wide uppercase">
            {t("home.yourActivity")}
          </h2>
          <div className="bg-card overflow-hidden rounded-xl">
            <ActivityGraph
              days={activity.data?.data ?? []}
              loading={activity.isPending}
              error={activity.isError}
            />
            <div aria-hidden="true" className="bg-foreground/5 h-px" />
            <WeeklyFocusChart
              days={activity.data?.data ?? []}
              loading={activity.isPending}
              error={activity.isError}
            />
          </div>
          <h2 className="text-muted-foreground mt-8 mb-2 text-[11px] font-semibold tracking-wide uppercase">
            {t("home.recent.title")}
          </h2>
          <RecentSessions
            sessions={recent.data?.data ?? []}
            icons={icons.data ?? {}}
            loading={recent.isPending}
            error={recent.isError}
            onRename={(session) =>
              setRenaming({ id: session.id, name: session.name })
            }
            onDelete={(session) =>
              setDeleting({ id: session.id, name: session.name })
            }
          />
        </div>
      </div>
      <RenameSessionModal
        open={renaming !== null}
        initialName={renaming?.name ?? ""}
        pending={renameSession.isPending}
        onOpenChange={(open) => {
          if (!open) setRenaming(null);
        }}
        onSubmit={(name) => {
          if (renaming) renameSession.mutate({ id: renaming.id, name });
        }}
      />
      <DeleteSessionDialog
        open={deleting !== null}
        sessionName={deleting?.name ?? ""}
        pending={deleteSession.isPending}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        onConfirm={() => {
          if (deleting) deleteSession.mutate(deleting.id);
        }}
      />
      {me.data && (
        <EditProfileModal
          open={editing}
          onOpenChange={setEditing}
          user={me.data}
          pending={updateProfile.isPending}
          // suppress the banner only for errors the modal renders inline
          // (username) — an avatar/banner/location 422 must stay visible
          errorMessage={
            updateProfile.isError &&
            !Object.keys(fieldErrors).some((field) => field === "username")
              ? extractApiErrorMessage(updateProfile.error)
              : null
          }
          fieldErrors={fieldErrors}
          onSubmit={(state) => updateProfile.mutate(state)}
        />
      )}
    </main>
  );
}
