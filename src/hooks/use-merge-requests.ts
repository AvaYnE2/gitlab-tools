import { api } from "@/lib/api-client";
import { MergeRequestResponse } from "@/types/gitlab";
import { useQuery } from "@tanstack/react-query";

// Hook for fetching all merge requests across projects
export function useMergeRequests(
  state = "opened",
  scope = "created_by_me",
  page = 1,
  perPage = 20,
  enabled = true,
) {
  return useQuery({
    queryKey: ["merge-requests", state, scope, page, perPage],
    queryFn: () => api.getAllMergeRequests(state, scope, page, perPage),
    enabled,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true,
  });
}
