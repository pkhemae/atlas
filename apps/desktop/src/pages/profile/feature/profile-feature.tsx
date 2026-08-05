import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type AuthUser } from "@/lib/api";
import {
  extractApiErrorMessage,
  extractApiFieldErrors,
} from "@/lib/api-errors";
import { useMe } from "@/pages/profile/feature/use-me";
import {
  ActivityGraph,
  type ActivityDay,
} from "@/pages/profile/ui/activity-graph";
import {
  EditProfileModal,
  type EditProfileFormState,
} from "@/pages/profile/ui/edit-profile-modal";
import { ProfileCard } from "@/pages/profile/ui/profile-card";

interface ActivityResponse {
  data: ActivityDay[];
}

export function ProfileFeature() {
  const me = useMe();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);

  const activity = useQuery({
    queryKey: ["focus", "activity"],
    queryFn: () =>
      api.get("/api/v1/focus/activity", {}) as Promise<ActivityResponse>,
  });

  // API contract: absent key = untouched, File = replace, null = remove
  // (tuyau serializes null as an empty field and switches to multipart
  // on its own when the body holds a File)
  const updateProfile = useMutation({
    mutationFn: (state: EditProfileFormState) => {
      const body = {
        fullName: state.fullName,
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
      return api.patch("/api/v1/auth/me", { body }) as Promise<AuthUser>;
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
    <main className="bg-background min-h-svh px-6 pt-20 pb-8">
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
            Your activity
          </h2>
          <ActivityGraph
            days={activity.data?.data ?? []}
            loading={activity.isPending}
          />
        </div>
      </div>
      {me.data && (
        <EditProfileModal
          open={editing}
          onOpenChange={setEditing}
          user={me.data}
          pending={updateProfile.isPending}
          // a field-level error already shows inline — no double display
          errorMessage={
            updateProfile.isError && Object.keys(fieldErrors).length === 0
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

function memberSince(createdAt: string | null): string | null {
  const parsed = createdAt ? new Date(createdAt) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}
