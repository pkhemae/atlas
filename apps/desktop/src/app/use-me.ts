import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

/**
 * The authenticated user, shared cache-wise by the sidebar footer, the
 * home page and the edit-profile modal (single ["me"] entry).
 */
export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: () => api.get("/api/v1/auth/me", {}),
    retry: false,
  });
}
