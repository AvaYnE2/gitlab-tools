import type {
  GitLabBranch,
  GitLabProject,
  MergeRequestResponse,
  MergeRequestResult,
} from "./types";
import { decryptToken } from "./utils";

const GITLAB_API_URL =
  process.env.GITLAB_API_URL || "https://gitlab.com/api/v4";

// Base function for GitLab API requests
async function gitlabApiRequest<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(`${GITLAB_API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.text().catch(() => "Unknown error");
    throw new Error(
      `GitLab API Error: ${response.status} ${response.statusText} - ${error}`,
    );
  }

  return (await response.json()) as T;
}

// Fetch projects with pagination
export async function fetchGitLabProjects(
  encryptedToken: string,
  page = 1,
  perPage = 20,
  search = "",
): Promise<{ projects: GitLabProject[]; totalCount: number }> {
  const token = decryptToken(encryptedToken);

  console.log("token", token);

  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
    order_by: "last_activity_at",
    sort: "desc",
    membership: "true",
    owned: "true",
    min_access_level: "30", // Developer access or higher
    repository_access_level: "enabled",
  });

  if (search) {
    params.append("search", search);
  }

  const url = `/projects?${params.toString()}`;
  console.log("token", token);
  const response = await fetch(`${GITLAB_API_URL}${url}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

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

// Fetch branches for a project
export async function fetchProjectBranches(
  encryptedToken: string,
  projectId: number,
): Promise<GitLabBranch[]> {
  const token = decryptToken(encryptedToken);
  if (!token) {
    throw new Error("No token found");
  }
  return gitlabApiRequest<GitLabBranch[]>(
    `/projects/${projectId}/repository/branches`,
    token,
  );
}

// Check for open merge requests
export async function fetchOpenMergeRequests(
  encryptedToken: string,
  projectId: number,
  sourceBranch: string,
): Promise<MergeRequestResponse[]> {
  const token = decryptToken(encryptedToken);
  if (!token) {
    throw new Error("No token found");
  }
  const params = new URLSearchParams({
    state: "opened",
    source_branch: sourceBranch,
  });

  return gitlabApiRequest<MergeRequestResponse[]>(
    `/projects/${projectId}/merge_requests?${params.toString()}`,
    token,
  );
}

// Close a merge request
export async function closeMergeRequest(
  encryptedToken: string,
  projectId: number,
  mergeRequestIid: number,
): Promise<MergeRequestResponse> {
  const token = decryptToken(encryptedToken);
  if (!token) {
    throw new Error("No token found");
  }
  return gitlabApiRequest<MergeRequestResponse>(
    `/projects/${projectId}/merge_requests/${mergeRequestIid}`,
    token,
    {
      method: "PUT",
      body: JSON.stringify({ state_event: "close" }),
    },
  );
}

// Create a single merge request
export async function createMergeRequest(
  encryptedToken: string,
  projectId: number,
  params: {
    sourceBranch: string;
    targetBranch: string;
    title: string;
    description?: string;
    removeSourceBranch?: boolean;
    squash?: boolean;
  },
): Promise<MergeRequestResponse> {
  const token = decryptToken(encryptedToken);
  if (!token) {
    throw new Error("No token found");
  }
  const body = {
    source_branch: params.sourceBranch,
    target_branch: params.targetBranch,
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
  encryptedToken: string,
  projectIds: number[],
  params: {
    sourceBranch: string;
    targetBranch: string | Record<number, string>;
    title: string;
    description?: string;
    removeSourceBranch?: boolean;
    squash?: boolean;
  },
): Promise<MergeRequestResult[]> {
  const token = decryptToken(encryptedToken);
  if (!token) {
    throw new Error("No token found");
  }
  const results: MergeRequestResult[] = [];

  for (const projectId of projectIds) {
    try {
      // First, fetch the project name for better reporting
      const project = await gitlabApiRequest<GitLabProject>(
        `/projects/${projectId}`,
        token,
      );

      try {
        // Determine the correct target branch
        let targetBranch: string;
        if (typeof params.targetBranch === "string") {
          targetBranch = params.targetBranch;
        } else {
          targetBranch = params.targetBranch[projectId] || "main";
        }

        // Create merge request parameters
        const mrParams = {
          sourceBranch: params.sourceBranch,
          targetBranch,
          title: params.title,
          description: params.description,
          removeSourceBranch: params.removeSourceBranch,
          squash: params.squash,
        };

        // Attempt to create the merge request
        const mergeRequest = await createMergeRequest(
          encryptedToken,
          projectId,
          mrParams,
        );

        const result: MergeRequestResult = {
          projectId,
          projectName: project.name,
          success: true,
          mergeRequest,
        };

        results.push(result);
      } catch (error) {
        const result: MergeRequestResult = {
          projectId,
          projectName: project.name,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };

        results.push(result);
      }
    } catch (error) {
      // If we can't even fetch the project, still report an error
      const result: MergeRequestResult = {
        projectId,
        projectName: `Project ${projectId}`,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };

      results.push(result);
    }
  }

  return results;
}

// Check if a branch exists in a project
export async function branchExists(
  encryptedToken: string,
  projectId: number,
  branchName: string,
): Promise<boolean> {
  const token = decryptToken(encryptedToken);
  if (!token) {
    throw new Error("No token found");
  }
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
