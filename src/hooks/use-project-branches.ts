import { fetchProjectBranches } from "@/lib/gitlab-api";
import { GitLabBranch } from "@/types/gitlab";
import { useQuery } from "@tanstack/react-query";

interface UseProjectBranchesParams {
  projectId: number;
  token: string | null;
  enabled?: boolean;
}

export function useProjectBranches({
  projectId,
  token,
  enabled = true,
}: UseProjectBranchesParams) {
  return useQuery({
    queryKey: ["project-branches", projectId],
    queryFn: async () => {
      if (!token) {
        throw new Error("Token is required");
      }
      return await fetchProjectBranches(projectId, token);
    },
    enabled: !!token && enabled && projectId > 0,
  });
}
