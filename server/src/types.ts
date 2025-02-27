// GitLab API types
export interface GitLabProject {
  id: number;
  name: string;
  description: string | null;
  web_url: string;
  avatar_url: string | null;
  last_activity_at: string;
  namespace: {
    name: string;
  };
  star_count: number;
  visibility: string;
  default_branch: string;
  repository_access_level?: string;
}

export interface GitLabBranch {
  name: string;
  merged: boolean;
  protected: boolean;
  default: boolean;
  web_url: string;
}

export interface MergeRequestResponse {
  id: number;
  iid: number;
  project_id: number;
  title: string;
  description: string;
  state: string;
  web_url: string;
  created_at: string;
  project_name?: string; // Added for our enhanced response
}

// API request/response types
export interface ProjectsResponse {
  projects: GitLabProject[];
  totalCount: number;
}

export interface MergeRequestsRequest {
  projectIds: number[];
  sourceBranch: string;
  targetBranch: string | Record<number, string>;
  title: string;
  description?: string;
  removeSourceBranch?: boolean;
  squash?: boolean;
}

export interface MergeRequestCheck {
  projectId: number;
  hasMergeRequest: boolean;
  mergeRequest?: MergeRequestResponse;
}

export interface MergeRequestResult {
  projectId: number;
  projectName: string;
  success: boolean;
  mergeRequest?: MergeRequestResponse;
  error?: string;
}

export interface TokenData {
  encryptedToken: string;
}
