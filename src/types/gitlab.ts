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
  cached?: boolean; // Flag for cached projects
}

export interface GitLabApiResponse {
  projects: GitLabProject[];
  totalCount: number;
}

export interface MergeRequestsResponseWrapper {
  mergeRequests: MergeRequestResponse[];
  totalCount: number;
}

export interface GitLabBranch {
  name: string;
  merged: boolean;
  protected: boolean;
  default: boolean;
  web_url: string;
}

export interface MergeRequestCreateParams {
  sourceBranch: string;
  targetBranch: string | Record<number, string>; // Can be a string or a map of project ID to target branch
  title: string;
  description?: string;
  removeSourceBranch?: boolean;
  squash?: boolean;
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
}

export interface MergeRequestResult {
  projectId: number;
  projectName: string;
  success: boolean;
  mergeRequest?: MergeRequestResponse;
  error?: string;
}

// For backward compatibility - alias for MergeRequestResult
export type MultiMergeRequestResult = MergeRequestResult;
