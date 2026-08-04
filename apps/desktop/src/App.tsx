import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthGate } from "@/pages/auth/feature/auth-gate";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate />
    </QueryClientProvider>
  );
}

export default App;
