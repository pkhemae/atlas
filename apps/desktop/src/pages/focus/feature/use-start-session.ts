import { useMutation } from "@tanstack/react-query";
import { emitTo } from "@tauri-apps/api/event";
import { api } from "@/lib/api";
import type { FocusSession } from "@/lib/focus";
import { hideMain, showDock } from "@/lib/windows";

interface StartPayload {
  data: FocusSession;
}

/**
 * Starts a session then swaps windows: dock in, main out. The dock also
 * fetches the active session on mount, so the emit is a fast path, not a
 * single point of failure.
 */
export function useStartSession() {
  return useMutation({
    mutationFn: () =>
      api.post("/api/v1/focus/sessions", {}) as Promise<StartPayload>,
    onSuccess: async ({ data }) => {
      await emitTo("dock", "focus:start", data);
      await showDock();
      await hideMain();
    },
  });
}
