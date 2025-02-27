// API client for the backend server

import type { ProjectsResponse } from "../../server/src/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3010";
console.log("Using API URL:", API_URL);

// Helper function for making API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    localStorage.getItem("gitlab_token") ||
    sessionStorage.getItem("gitlab_token");

  console.log("Token:", token);
  console.log("options", options);
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
    ...(token && { Authorization: `${token}` }),
    Accept: "application/json",
  };

  console.log("Headers:", headers);

  const config: RequestInit = {
    ...options,
    headers,
    // mode: 'cors' // Explicitly set CORS mode
  };

  // Log request for debugging
  console.log(`Sending request to ${API_URL}${endpoint}`, {
    headers,
    method: options.method || "GET",
  });

  const response = await fetch(`${API_URL}${endpoint}`, config);

  // Log response for debugging
  console.log(`Response from ${API_URL}${endpoint}:`, {
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries([...response.headers.entries()]),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    console.error(
      `API Error: ${response.status} ${response.statusText} - ${errorText}`,
    );
    throw new Error(
      `API Error: ${response.status} ${response.statusText} - ${errorText}`,
    );
  }

  // Handle potentially empty responses (status 204)
  if (response.status === 204) {
    return {} as T;
  }

  // Parse JSON for all other successful responses
  try {
    return (await response.json()) as T;
  } catch (error) {
    console.error("Failed to parse JSON response:", error);
    return {} as T;
  }
}

// API functions that match the backend endpoints
export const api = {
  // Auth
  validateToken: async (token: string) => {
    return apiRequest<{ success: boolean; token: string; error?: string }>(
      "/auth/validate",
      {
        method: "POST",
        body: JSON.stringify({ token }),
      },
    );
  },

  // Projects
  getProjects: async (page = 1, perPage = 20, search = "") => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("perPage", perPage.toString());
    if (search) params.append("search", search);

    return apiRequest<ProjectsResponse>(`/projects?${params.toString()}`);
  },

  // Branches
  getProjectBranches: async (projectId: number) => {
    return apiRequest(`/projects/${projectId}/branches`);
  },

  checkBranchExists: async (projectId: number, branchName: string) => {
    return apiRequest(
      `/projects/${projectId}/branches/${encodeURIComponent(branchName)}/exists`,
    );
  },

  // Merge Requests
  checkMergeRequests: async (projectIds: number[], sourceBranch: string) => {
    return apiRequest("/merge-requests/check", {
      method: "POST",
      body: JSON.stringify({ projectIds, sourceBranch }),
    });
  },

  createMergeRequests: async (data: {
    projectIds: number[];
    sourceBranch: string;
    targetBranch: string | Record<number, string>;
    title: string;
    description?: string;
    removeSourceBranch?: boolean;
    squash?: boolean;
  }) => {
    return apiRequest("/merge-requests/create", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  closeMergeRequest: async (projectId: number, mergeRequestIid: number) => {
    return apiRequest(`/merge-requests/${projectId}/${mergeRequestIid}/close`, {
      method: "POST",
    });
  },
};
