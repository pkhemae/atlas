import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Outlet } from "@tanstack/react-router";
import { listen } from "@tauri-apps/api/event";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { AppNavbar } from "@/components/app-navbar";
import { api } from "@/lib/api";
import { useStartSession } from "@/pages/focus/feature/use-start-session";
import { UserMenuFeature } from "@/pages/profile/feature/user-menu-feature";

export function AppLayout() {
  const queryClient = useQueryClient();
  const startSession = useStartSession();

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
      <Outlet />
      <AppNavbar
        onStartSession={() => startSession.mutate()}
        startPending={startSession.isPending}
      />
      <UserMenuFeature />
    </>
  );
}
