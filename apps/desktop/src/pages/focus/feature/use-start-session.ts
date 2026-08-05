import { useMutation } from "@tanstack/react-query";
import { emitTo } from "@tauri-apps/api/event";
import { api } from "@/lib/api";
import { hideMain, showDock } from "@/lib/windows";

/**
 * Starts a session then swaps windows: dock in, main out. The dock also
 * fetches the active session on mount, so the emit is a fast path, not a
 * single point of failure.
 */
export function useStartSession() {
  return useMutation({
    mutationFn: () => api.post("/api/v1/focus/sessions", {}),
    onSuccess: async ({ data }) => {
      // show the (transparent, still empty) dock window BEFORE handing the
      // session over: the pill's enter animation must play on screen, not
      // while the window is hidden
      const dockUp = await showDock();
      await emitTo("dock", "focus:start", data);
      // never hide the last visible window: main only goes away once
      // the dock is actually up
      if (dockUp) {
        await hideMain();
      }
    },
  });
}
