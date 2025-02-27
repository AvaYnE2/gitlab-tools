import { api } from "@/lib/api-client";
import type { GitLabProject, MergeRequestResponse } from "@/types/gitlab";
import { useQuery } from "@tanstack/react-query";

// 30 second stale time to prevent excessive refetching
const STALE_TIME = 1000 * 30;

interface MergeRequestCheck {
  projectId: number;
  hasMergeRequest: boolean;
  mergeRequest?: MergeRequestResponse;
}

type MRCheckRecord = Record<number, MergeRequestCheck>;

export function useCheckMergeRequests(
  projects: GitLabProject[] | undefined,
  sourceBranch: string,
  token: string | null,
) {
  // Create a safe array of project IDs, handling the case when projects is undefined
  const projectIds = projects?.map((p) => p.id) || [];

  return useQuery<MRCheckRecord>({
    queryKey: ["merge-requests-check", projectIds, sourceBranch, token],
    queryFn: async (): Promise<Record<number, MergeRequestCheck>> => {
      if (!token || !projectIds.length || !sourceBranch) {
        return {};
      }

      // Use the safe projectIds array we created earlier

      // Use the API client to check for merge requests
      return api.checkMergeRequests(projectIds, sourceBranch);
    },
    staleTime: STALE_TIME,
    refetchOnWindowFocus: false,
    enabled: !!token && projectIds.length > 0 && !!sourceBranch,
  });
}
