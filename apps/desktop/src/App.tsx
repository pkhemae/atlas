import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthGate } from "@/pages/auth/feature/auth-gate";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* with the transparent Overlay title bar the webview swallows mouse
          events in the old drag zone — reclaim it (double-click maximizes) */}
      <div data-tauri-drag-region className="fixed inset-x-0 top-0 z-50 h-9" />
      <AuthGate />
    </QueryClientProvider>
  );
}

export default App;
