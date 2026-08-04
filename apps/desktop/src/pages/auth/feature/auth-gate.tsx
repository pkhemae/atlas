import { useCallback, useEffect, useState } from "react";
import { Screen } from "@/components/screen";
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
      <Screen>
        <p className="text-muted-foreground animate-pulse text-sm">
          Starting Atlas…
        </p>
      </Screen>
    );
  }

  if (status === "authed") {
    return <HomeFeature onLoggedOut={handleLoggedOut} />;
  }

  return <AuthFeature onAuthenticated={handleAuthenticated} />;
}
