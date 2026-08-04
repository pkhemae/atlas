import { useCallback, useEffect, useState } from "react";
import { setAuthToken } from "@/lib/api";
import { getAuthToken } from "@/lib/secure-storage";
import { AuthFeature } from "@/pages/auth/feature/auth-feature";
import { HomeFeature } from "@/pages/home/feature/home-feature";

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

  const handleLoggedOut = useCallback(() => setStatus("guest"), []);
  const handleAuthenticated = useCallback(() => setStatus("authed"), []);

  if (status === "booting") {
    return (
      <main className="bg-background flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground animate-pulse text-sm">
          Starting Atlas…
        </p>
      </main>
    );
  }

  if (status === "authed") {
    return <HomeFeature onLoggedOut={handleLoggedOut} />;
  }

  return <AuthFeature onAuthenticated={handleAuthenticated} />;
}
