import { api } from "@/lib/api-client";
import { cacheProjects, getCachedProjects } from "@/lib/storage";
import type { GitLabProject } from "@/types/gitlab";
import { useQuery } from "@tanstack/react-query";

interface UseGitLabProjectsParams {
  token: string | null;
  page?: number;
  perPage?: number;
  search?: string;
  skipCache?: boolean;
}

interface ProjectsResponse {
  projects: GitLabProject[];
  totalCount: number;
  fromCache?: boolean;
}

export function useGitLabProjects({
  token,
  page = 1,
  perPage = 20,
  search = "",
  skipCache = false,
}: UseGitLabProjectsParams) {
  return useQuery<ProjectsResponse>({
    queryKey: ["projects", page, perPage, search, token],
    queryFn: async () => {
      if (!token) {
        throw new Error("Token is required");
      }

      // If there's a search term or we're not on the first page, skip cache
      if (search || page > 1 || skipCache) {
        const response = await api.getProjects(page, perPage, search);

        // If it's a search with no results, don't cache
        if (search || response.projects.length === 0) {
          return response;
        }

        // Cache the first page results if not searching
        if (page === 1) {
          const projectsToCache = response.projects.map((project) => ({
            id: project.id,
            name: project.name,
            description: project.description,
            web_url: project.web_url,
            avatar_url: project.avatar_url,
            namespace: { name: project.namespace.name },
            default_branch: project.default_branch,
            visibility: project.visibility,
            last_updated: Date.now(),
          }));

          cacheProjects(projectsToCache);
        }

        return response;
      }

      // Try to get projects from cache first (for first page, no search)
      const cachedProjects = getCachedProjects();

      if (cachedProjects && cachedProjects.length > 0) {
        console.log("Using cached projects data");

        // Convert cached projects to GitLabProject format
        const projects = cachedProjects.map((project) => ({
          ...project,
          star_count: 0, // Non-critical field, default value
          visibility: project.visibility, // Non-critical field, default value
          repository_access_level: "enabled", // Assume enabled if in cache
          last_activity_at: new Date(project.last_updated).toISOString(),
          cached: true, // Add flag to indicate it's from cache
        })) as GitLabProject[];

        return {
          projects: projects.slice(0, perPage), // Respect the perPage parameter
          totalCount: projects.length,
          fromCache: true, // Add flag to response to indicate it's from cache
        };
      }

      // If no cache or expired, fetch from API and cache the result
      const response = await api.getProjects(page, perPage, search);

      // Only cache if we got results
      if (response.projects.length > 0) {
        const projectsToCache = response.projects.map((project) => ({
          id: project.id,
          name: project.name,
          description: project.description,
          web_url: project.web_url,
          avatar_url: project.avatar_url,
          namespace: { name: project.namespace.name },
          default_branch: project.default_branch,
          visibility: project.visibility,
          last_updated: Date.now(),
        }));

        cacheProjects(projectsToCache);
      }

      return response;
    },
    enabled: !!token,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
