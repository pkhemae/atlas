import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouteContext } from "@tanstack/react-router";
import { api, setAuthToken, type AuthUser } from "@/lib/api";
import { deleteAuthToken } from "@/lib/secure-storage";
import { UserMenu } from "@/pages/profile/ui/user-menu";

export function UserMenuFeature() {
  const { onLoggedOut } = useRouteContext({ from: "__root__" });
  const queryClient = useQueryClient();

  const me = useQuery({
    queryKey: ["me"],
    queryFn: () => api.get("/api/v1/auth/me", {}) as Promise<AuthUser>,
    retry: false,
  });

  const logout = useMutation({
    mutationFn: async () => {
      // best effort: even if the API is unreachable, drop the local session
      await api.post("/api/v1/auth/logout", {}).catch(() => {});
    },
    onSettled: async () => {
      setAuthToken(null);
      await deleteAuthToken();
      queryClient.removeQueries({ queryKey: ["me"] });
      onLoggedOut();
    },
  });

  // only a rejected token means the session is dead — a network failure
  // (API not running) must NOT destroy a valid keychain token
  const meUnauthorized =
    me.isError && (me.error as { status?: number }).status === 401;
  useEffect(() => {
    if (!meUnauthorized) return;
    setAuthToken(null);
    deleteAuthToken().finally(() => onLoggedOut());
  }, [meUnauthorized, onLoggedOut]);

  return (
    <div className="animate-in fade-in fixed top-2.5 right-3 z-[60] duration-500">
      {me.isPending || meUnauthorized ? (
        <div
          aria-hidden="true"
          className="bg-foreground/10 size-9 animate-pulse rounded-full"
        />
      ) : me.isError ? (
        <button
          type="button"
          aria-label="Can't reach the Atlas API — click to retry"
          title="Can't reach the Atlas API — click to retry"
          onClick={() => me.refetch()}
          className="text-muted-foreground hover:text-foreground bg-foreground/10 flex size-9 items-center justify-center rounded-full text-sm transition-colors"
        >
          !
        </button>
      ) : (
        <UserMenu
          initials={me.data.initials}
          loggingOut={logout.isPending}
          onLogout={() => logout.mutate()}
        />
      )}
    </div>
  );
}
