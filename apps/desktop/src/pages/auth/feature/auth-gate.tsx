import { useCallback, useEffect, useState } from "react";
import { RouterProvider } from "@tanstack/react-router";
import { appRouter } from "@/app/router";
import { Screen } from "@/components/screen";
import { setAuthToken } from "@/lib/api";
import { getAuthToken } from "@/lib/secure-storage";
import { AuthFeature } from "@/pages/auth/feature/auth-feature";

type AuthStatus = "booting" | "guest" | "authed";

export function AuthGate() {
  const [status, setStatus] = useState<AuthStatus>("booting");

  useEffect(() => {
    getAuthToken()
      .then((token) => {
        if (token) {
          setAuthToken(token);
          setStatus("authed");
        } else {
          setStatus("guest");
        }
      })
      .catch(() => setStatus("guest"));
  }, []);

  const handleLoggedOut = useCallback(() => {
    // the memory history outlives the session — the next account must
    // not land on the previous one's route
    appRouter.navigate({ to: "/" });
    setStatus("guest");
  }, []);
  const handleAuthenticated = useCallback(() => setStatus("authed"), []);

  if (status === "booting") {
    return (
      <Screen>
        <p className="text-muted-foreground animate-pulse text-sm">
          Starting Atlas…
        </p>
      </Screen>
    );
  }

  if (status === "authed") {
    return (
      <RouterProvider
        router={appRouter}
        context={{ onLoggedOut: handleLoggedOut }}
      />
    );
  }

  return <AuthFeature onAuthenticated={handleAuthenticated} />;
}
