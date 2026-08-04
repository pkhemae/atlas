import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@atlas/ui/components/button";
import { api, setAuthToken, type AuthUser } from "@/lib/api";
import { deleteAuthToken } from "@/lib/secure-storage";
import { HomeScreen } from "@/pages/home/ui/home-screen";

interface HomeFeatureProps {
  onLoggedOut: () => void;
}

export function HomeFeature({ onLoggedOut }: HomeFeatureProps) {
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

  if (me.isPending || meUnauthorized) {
    return (
      <main className="bg-background flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground animate-pulse text-sm">
          Loading your session…
        </p>
      </main>
    );
  }

  if (me.isError) {
    return (
      <main className="bg-background flex min-h-svh flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground text-sm">
          Can&apos;t reach the Atlas API. Is it running?
        </p>
        <Button variant="secondary" onClick={() => me.refetch()}>
          Retry
        </Button>
      </main>
    );
  }

  return (
    <HomeScreen
      user={me.data}
      loggingOut={logout.isPending}
      onLogout={() => logout.mutate()}
    />
  );
}
