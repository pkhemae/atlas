import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthGate } from "@/pages/auth/feature/auth-gate";
import { DockFeature } from "@/pages/focus/feature/dock-feature";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      // session start/stop hides and re-shows the windows constantly —
      // focus-driven refetches would stack on the explicit invalidations
      refetchOnWindowFocus: false,
    },
  },
});

// the dock is a second webview of the same app, selected by query param
const isDockWindow =
  new URLSearchParams(window.location.search).get("window") === "dock";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {isDockWindow ? (
        <DockFeature />
      ) : (
        <>
          {/* with the transparent Overlay title bar the webview swallows mouse
              events in the old drag zone — reclaim it (double-click maximizes) */}
          <div
            data-tauri-drag-region
            className="fixed inset-x-0 top-0 z-50 h-9"
          />
          <AuthGate />
        </>
      )}
    </QueryClientProvider>
  );
}

export default App;
