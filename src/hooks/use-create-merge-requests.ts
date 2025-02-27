import { api } from "@/lib/api-client";
import type {
  MergeRequestCreateParams,
  MergeRequestResult,
} from "@/types/gitlab";
import { useMutation } from "@tanstack/react-query";

interface UseCreateMergeRequestsParams {
  token: string | null;
  onProgress?: (result: MergeRequestResult) => void;
  onSuccess?: (results: MergeRequestResult[]) => void;
}

interface CreateMergeRequestsArgs {
  projectIds: number[];
  params: MergeRequestCreateParams;
}

export function useCreateMergeRequests({
  token,
  onProgress,
  onSuccess,
}: UseCreateMergeRequestsParams) {
  return useMutation({
    mutationFn: async ({ projectIds, params }: CreateMergeRequestsArgs) => {
      if (!token) {
        throw new Error("Token is required");
      }

      // Use the API client to create merge requests
      const results = await api.createMergeRequests({
        projectIds,
        sourceBranch: params.sourceBranch,
        targetBranch: params.targetBranch,
        title: params.title,
        description: params.description,
        removeSourceBranch: params.removeSourceBranch,
        squash: params.squash,
      });

      // Call progress callback for each result
      if (onProgress) {
        results.forEach((result) => onProgress(result));
      }

      return results;
    },
    onSuccess: (results) => {
      if (onSuccess) {
        onSuccess(results);
      }
    },
  });
}
