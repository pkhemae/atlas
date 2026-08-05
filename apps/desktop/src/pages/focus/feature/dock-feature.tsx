import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { listen } from "@tauri-apps/api/event";
import { LogicalSize } from "@tauri-apps/api/dpi";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import { emitTo } from "@tauri-apps/api/event";
import i18n, { type Language } from "@/i18n";
import { applyThemeLocally, type ThemeId } from "@/theme";
import { api, setAuthToken } from "@/lib/api";
import { elapsedSeconds, type FocusSession } from "@/lib/focus";
import { getAuthToken } from "@/lib/secure-storage";
import {
  loadAmbientState,
  saveAmbientState,
  type AmbientSoundId,
  type AmbientState,
} from "@/lib/ambient";
import { stopAllAmbient, syncAmbient } from "@/lib/ambient-engine";
import { hideDock, showMain } from "@/lib/windows";
import { Dock } from "@/pages/focus/ui/dock";

interface SessionPayload {
  data: FocusSession;
}

/** Keep in sync with the exit animation duration in ui/dock.tsx. */
const EXIT_MS = 250;
/** Beat of nothing between the dock folding away and main returning. */
const MAIN_RETURN_MS = 400;

export function DockFeature() {
  const [booted, setBooted] = useState(false);
  const [session, setSession] = useState<FocusSession | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [actionFailed, setActionFailed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [ambient, setAmbient] = useState<AmbientState>(loadAmbientState);

  // the dock window is its own webview: transparent chrome + own token
  useEffect(() => {
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
    getAuthToken()
      .then((token) => {
        if (token) setAuthToken(token);
      })
      .finally(() => setBooted(true));
  }, []);

  // fast path: the main window hands the session over on start. This
  // webview booted before the user logged in, so re-read the keychain
  // token here — without it every dock mutation would 401 silently
  useEffect(() => {
    const unlisten = listen<FocusSession>("focus:start", async (event) => {
      const token = await getAuthToken().catch(() => null);
      if (token) setAuthToken(token);
      setSettingsOpen(false);
      setLeaving(false);
      setSession(event.payload);
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  // the audio graph mirrors the settings: sounds play while a session
  // exists (running OR paused — the timer's pause keeps the ambience),
  // fade out on stop/abandon, and follow volume live. `leaving` starts
  // the audio fade together with the pill's exit animation
  useEffect(() => {
    syncAmbient(ambient, session !== null && !leaving);
  }, [ambient, session, leaving]);
  useEffect(() => {
    saveAmbientState(ambient);
  }, [ambient]);
  useEffect(() => () => stopAllAmbient(), []);

  // the settings panel needs room: the transparent window grows under
  // the pill while open, and shrinks back so it stops swallowing clicks
  useEffect(() => {
    const height = settingsOpen ? 200 : 44;
    void getCurrentWebviewWindow()
      .setSize(new LogicalSize(208, height))
      .catch(() => {});
  }, [settingsOpen]);

  // the language can change in the main window while the dock is open
  useEffect(() => {
    const unlisten = listen<Language>("i18n:changed", (event) => {
      void i18n.changeLanguage(event.payload);
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  // same for the theme — the dock accents follow the app theme
  useEffect(() => {
    const unlisten = listen<ThemeId>("theme:changed", (event) => {
      applyThemeLocally(event.payload);
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  // graceful dismissal: the pill plays its exit animation (the ambience
  // fades alongside), then the windows swap back and the session drops
  const dismissDock = async (notifyMain: boolean) => {
    setLeaving(true);
    if (notifyMain) await emitTo("main", "focus:completed", null);
    await new Promise((resolve) => setTimeout(resolve, EXIT_MS));
    await hideDock();
    // reset only once hidden — closing the panel earlier would shrink
    // the window and clip its own exit animation
    setSettingsOpen(false);
    setSession(null);
    setLeaving(false);
    // the swap reads as two moments, not a hard cut: a beat of nothing,
    // then the main window comes back
    await new Promise((resolve) => setTimeout(resolve, MAIN_RETURN_MS));
    await showMain();
  };

  // if a control fails (network blip, expired token), re-sync with the
  // server instead of keeping a lying timer on screen
  const resync = async () => {
    setActionFailed(true);
    const token = await getAuthToken().catch(() => null);
    if (token) setAuthToken(token);
    try {
      const payload = (await api.get("/api/v1/focus/sessions/active", {})) as
        SessionPayload | string;
      if (payload && typeof payload === "object" && "data" in payload) {
        setSession(payload.data);
      } else {
        await dismissDock(false);
      }
    } catch {
      // keep the current state; the next interaction retries
    }
  };

  // fallback: recover the active session after a reload/HMR of this webview
  useEffect(() => {
    if (!booted || session) return;
    (
      api.get("/api/v1/focus/sessions/active", {}) as Promise<
        SessionPayload | string
      >
    )
      .then((payload) => {
        if (payload && typeof payload === "object" && "data" in payload) {
          setSession(payload.data);
        }
      })
      .catch(() => {});
  }, [booted, session]);

  // display tick — elapsed is always recomputed from server timestamps
  useEffect(() => {
    if (!session || session.status !== "running") return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [session]);

  const pause = useMutation({
    mutationFn: (id: string) =>
      api.post("/api/v1/focus/sessions/:id/pause", {
        params: { id },
      }),
    onMutate: () => setActionFailed(false),
    onSuccess: ({ data }) => setSession(data),
    onError: resync,
  });

  const resume = useMutation({
    mutationFn: (id: string) =>
      api.post("/api/v1/focus/sessions/:id/resume", {
        params: { id },
      }),
    onMutate: () => setActionFailed(false),
    onSuccess: ({ data }) => {
      setSession(data);
      setNow(Date.now());
    },
    onError: resync,
  });

  const stop = useMutation({
    mutationFn: (id: string) =>
      api.post("/api/v1/focus/sessions/:id/complete", {
        params: { id },
      }),
    onMutate: () => setActionFailed(false),
    onSuccess: () => dismissDock(true),
    onError: resync,
  });

  if (
    !session ||
    (session.status !== "running" && session.status !== "paused")
  ) {
    return null;
  }

  const pending = pause.isPending || resume.isPending || stop.isPending;

  return (
    <Dock
      elapsed={elapsedSeconds(session, now)}
      status={session.status}
      pending={pending}
      error={actionFailed}
      settingsOpen={settingsOpen}
      leaving={leaving}
      ambient={ambient}
      onPause={() => pause.mutate(session.id)}
      onResume={() => resume.mutate(session.id)}
      onStop={() => stop.mutate(session.id)}
      onToggleSettings={() => setSettingsOpen((open) => !open)}
      onToggleSound={(id: AmbientSoundId) =>
        setAmbient((state) => ({
          ...state,
          [id]: { ...state[id], enabled: !state[id].enabled },
        }))
      }
      onVolumeChange={(id: AmbientSoundId, volume: number) =>
        setAmbient((state) => ({ ...state, [id]: { ...state[id], volume } }))
      }
    />
  );
}
