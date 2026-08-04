import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

  // a stale/expired keychain token means /me fails: clear it and start over
  const meFailed = me.isError;
  useEffect(() => {
    if (!meFailed) return;
    setAuthToken(null);
    deleteAuthToken().finally(() => onLoggedOut());
  }, [meFailed, onLoggedOut]);

  if (me.isPending || me.isError) {
    return (
      <main className="bg-background flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground animate-pulse text-sm">
          Loading your session…
        </p>
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
