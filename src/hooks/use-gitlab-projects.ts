import { api } from "@/lib/api-client";
import type { GitLabProject } from "@/types/gitlab";
import { useQuery } from "@tanstack/react-query";

interface UseGitLabProjectsParams {
  token: string | null;
  page?: number;
  perPage?: number;
  search?: string;
}

interface ProjectsResponse {
  projects: GitLabProject[];
  totalCount: number;
}

export function useGitLabProjects({
  token,
  page = 1,
  perPage = 20,
  search = "",
}: UseGitLabProjectsParams) {
  return useQuery<ProjectsResponse>({
    queryKey: ["projects", page, perPage, search, token],
    queryFn: async () => {
      if (!token) {
        throw new Error("Token is required");
      }

      const projects = await api.getProjects(page, perPage, search);
      console.log("projects", projects);
      return projects;
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
