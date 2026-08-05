import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  extractApiErrorMessage,
  extractApiFieldErrors,
} from "@/lib/api-errors";
import { memberSince } from "@/lib/focus";
import { useMe } from "@/app/use-me";
import { ActivityGraph } from "@/pages/home/ui/activity-graph";
import { WeeklyFocusChart } from "@/pages/home/ui/weekly-focus-chart";
import {
  EditProfileModal,
  type EditProfileFormState,
} from "@/pages/home/ui/edit-profile-modal";
import { ProfileCard } from "@/pages/home/ui/profile-card";

export function HomeFeature() {
  const { t } = useTranslation();
  const me = useMe();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);

  const activity = useQuery({
    queryKey: ["focus", "activity"],
    queryFn: () => api.get("/api/v1/focus/activity", {}),
    retry: false,
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
    <main className="bg-background min-h-svh px-6 pt-12 pb-8">
      <div className="animate-in fade-in slide-in-from-bottom-2 mx-auto flex w-full max-w-2xl items-start gap-8 duration-500">
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
            onEditProfile={openEditor}
          />
        ) : (
          <div className="bg-card h-96 w-60 shrink-0 animate-pulse rounded-xl" />
        )}
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
        </div>
      </div>
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
