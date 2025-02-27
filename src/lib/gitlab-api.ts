import type {
  GitLabApiResponse,
  GitLabBranch,
  GitLabProject,
  MergeRequestCreateParams,
  MergeRequestResponse,
  MultiMergeRequestResult,
} from "@/types/gitlab";

interface FetchProjectsParams {
  page?: number;
  perPage?: number;
  search?: string;
  token: string;
}

// Helper function to make GitLab API requests
async function gitlabApiRequest<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
  if (!token) {
    throw new Error("GitLab personal access token is required");
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(`https://gitlab.com/api/v4${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(
      `GitLab API Error: ${response.status} ${response.statusText}`,
    );
  }

  return (await response.json()) as T;
}

export async function fetchGitLabProjects({
  page = 1,
  perPage = 20,
  search = "",
  token,
}: FetchProjectsParams): Promise<GitLabApiResponse> {
  if (!token) {
    throw new Error("GitLab personal access token is required");
  }

  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
    order_by: "last_activity_at",
    sort: "desc",
    membership: "true",
    owned: "true",
    min_access_level: "30", // Developer access or higher (can create MRs)
    repository_access_level: "enabled",
  });

  if (search) {
    params.append("search", search);
  }

  const response = await fetch(
    `https://gitlab.com/api/v4/projects?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `GitLab API Error: ${response.status} ${response.statusText}`,
    );
  }

  const projects = (await response.json()) as GitLabProject[];
  const totalCountHeader = response.headers.get("x-total");
  const totalCount = totalCountHeader
    ? Number.parseInt(totalCountHeader, 10)
    : projects.length;

  return {
    projects,
    totalCount,
  };
}

// Fetch all branches for a project
export async function fetchProjectBranches(
  projectId: number,
  token: string,
): Promise<GitLabBranch[]> {
  return gitlabApiRequest<GitLabBranch[]>(
    `/projects/${projectId}/repository/branches`,
    token,
  );
}

// Create a merge request for a single project
export async function createMergeRequest(
  projectId: number,
  params: MergeRequestCreateParams,
  token: string,
): Promise<MergeRequestResponse> {
  // Determine the correct target branch for this project
  let targetBranch: string;
  if (typeof params.targetBranch === "string") {
    targetBranch = params.targetBranch;
  } else {
    // If it's a map, look up this project's target branch
    targetBranch = params.targetBranch[projectId] || "main"; // Default to 'main' if not found
  }

  const body = {
    source_branch: params.sourceBranch,
    target_branch: targetBranch,
    title: params.title,
    description: params.description || "",
    remove_source_branch: !!params.removeSourceBranch,
    squash: !!params.squash,
  };

  return gitlabApiRequest<MergeRequestResponse>(
    `/projects/${projectId}/merge_requests`,
    token,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );
}

// Create merge requests for multiple projects
export async function createMultipleProjectsMergeRequests(
  projectIds: number[],
  params: MergeRequestCreateParams,
  token: string,
  onProgress?: (result: MultiMergeRequestResult) => void,
): Promise<MultiMergeRequestResult[]> {
  const results: MultiMergeRequestResult[] = [];

  for (const projectId of projectIds) {
    try {
      // First, fetch the project name for better reporting
      const project = await gitlabApiRequest<GitLabProject>(
        `/projects/${projectId}`,
        token,
      );

      try {
        // Attempt to create the merge request
        const mergeRequest = await createMergeRequest(projectId, params, token);

        const result: MultiMergeRequestResult = {
          projectId,
          projectName: project.name,
          success: true,
          mergeRequest,
        };

        results.push(result);
        if (onProgress) onProgress(result);
      } catch (error) {
        const result: MultiMergeRequestResult = {
          projectId,
          projectName: project.name,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };

        results.push(result);
        if (onProgress) onProgress(result);
      }
    } catch (error) {
      // If we can't even fetch the project, still report an error
      const result: MultiMergeRequestResult = {
        projectId,
        projectName: `Project ${projectId}`,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };

      results.push(result);
      if (onProgress) onProgress(result);
    }
  }

  return results;
}

// Check if a branch exists in a project
export async function branchExists(
  projectId: number,
  branchName: string,
  token: string,
): Promise<boolean> {
  try {
    await gitlabApiRequest(
      `/projects/${projectId}/repository/branches/${encodeURIComponent(branchName)}`,
      token,
    );
    return true;
  } catch (error) {
    return false;
  }
}

// Fetch open merge requests for a project
export async function fetchOpenMergeRequests(
  projectId: number,
  sourceBranch: string,
  token: string,
): Promise<MergeRequestResponse[]> {
  const params = new URLSearchParams({
    state: "opened",
    source_branch: sourceBranch,
  });

  return gitlabApiRequest<MergeRequestResponse[]>(
    `/projects/${projectId}/merge_requests?${params.toString()}`,
    token,
  );
}

// Close/cancel a merge request
export async function closeMergeRequest(
  projectId: number,
  mergeRequestIid: number,
  token: string,
): Promise<MergeRequestResponse> {
  return gitlabApiRequest<MergeRequestResponse>(
    `/projects/${projectId}/merge_requests/${mergeRequestIid}`,
    token,
    {
      method: "PUT",
      body: JSON.stringify({ state_event: "close" }),
    },
  );
}
