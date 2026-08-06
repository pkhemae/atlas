import { useEffect } from "react";
import { TuyauHTTPError } from "@tuyau/core/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Outlet, useRouteContext } from "@tanstack/react-router";
import { Target } from "lucide-react";
import { listen } from "@tauri-apps/api/event";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { AppSidebar } from "@/components/app-sidebar";
import { api, setAuthToken } from "@/lib/api";
import { extractApiErrorMessage } from "@/lib/api-errors";
import { deleteAuthToken } from "@/lib/secure-storage";
import { useMe } from "@/app/use-me";
import { useStartSession } from "@/pages/focus/feature/use-start-session";

export function AppLayout() {
  const { onLoggedOut } = useRouteContext({ from: "__root__" });
  const queryClient = useQueryClient();
  const startSession = useStartSession();
  const me = useMe();

  const logout = useMutation({
    mutationFn: async () => {
      // best effort: even if the API is unreachable, drop the local session
      await api.post("/api/v1/auth/logout", {}).catch(() => {});
    },
    onSettled: async () => {
      setAuthToken(null);
      await deleteAuthToken();
      // full wipe: cached activity/profile data must never leak into
      // the next account's session
      queryClient.clear();
      onLoggedOut();
    },
  });

  // only a rejected token means the session is dead — a network failure
  // (API not running) must NOT destroy a valid keychain token
  const meUnauthorized =
    me.isError && me.error instanceof TuyauHTTPError && me.error.status === 401;
  useEffect(() => {
    if (!meUnauthorized) return;
    setAuthToken(null);
    deleteAuthToken().finally(() => onLoggedOut());
  }, [meUnauthorized, onLoggedOut]);

  // refresh session data whenever the dock finishes a session
  useEffect(() => {
    const unlisten = listen("focus:completed", () => {
      queryClient.invalidateQueries({ queryKey: ["focus"] });
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, [queryClient]);

  // crash recovery: an active server session while the main window is up
  // and the dock hidden can only be an orphan — close it right away so the
  // history never shows a ghost "In progress" entry
  useEffect(() => {
    (async () => {
      const dock = await WebviewWindow.getByLabel("dock");
      const dockVisible = (await dock?.isVisible().catch(() => false)) ?? false;
      if (dockVisible) return;

      await api
        .post("/api/v1/focus/sessions/abandon-active", {})
        .catch(() => {});
      queryClient.invalidateQueries({ queryKey: ["focus"] });
    })();
  }, [queryClient]);

  return (
    <>
      <AppSidebar
        user={
          me.data
            ? {
                name: me.data.fullName ?? me.data.email,
                initials: me.data.initials,
                avatarUrl: me.data.avatarUrl,
              }
            : null
        }
        mePending={me.isPending || meUnauthorized}
        meError={me.isError && !meUnauthorized}
        onRetryMe={() => me.refetch()}
        onStartSession={() => startSession.mutate()}
        startPending={startSession.isPending}
        startError={
          startSession.isError
            ? extractApiErrorMessage(startSession.error)
            : null
        }
        onLogout={() => logout.mutate()}
        loggingOut={logout.isPending}
      />
      {/* the layout owns the page background so decorations can sit
          under the (transparent) pages */}
      <div className="bg-background relative min-h-svh pl-52">
        {/* backdrop detail: a huge target peeking from the top-right */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed -top-44 -right-44 z-0"
        >
          <Target
            className="text-foreground/[0.02] size-[560px]"
            strokeWidth={1.5}
          />
        </div>
        <div className="relative">
          <Outlet />
        </div>
      </div>
    </>
  );
}
