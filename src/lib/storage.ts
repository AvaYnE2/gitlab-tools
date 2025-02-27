/**
 * Utility functions for storage in browser
 * Includes token management and project caching
 */

// Save token to storage (local or session)
export function saveToken(token: string, useSessionStorage: boolean): void {
  if (useSessionStorage) {
    sessionStorage.setItem("gitlab_token", token);
    localStorage.removeItem("gitlab_token"); // Clear from local storage if exists
  } else {
    localStorage.setItem("gitlab_token", token);
    sessionStorage.removeItem("gitlab_token"); // Clear from session storage if exists
  }
}

// Get token from storage (checks both local and session)
export function getToken(): string | null {
  return (
    localStorage.getItem("gitlab_token") ||
    sessionStorage.getItem("gitlab_token")
  );
}

// Clear token from all storage locations
export function clearToken(): void {
  localStorage.removeItem("gitlab_token");
  sessionStorage.removeItem("gitlab_token");
  // Also clear the project cache when logging out
  clearCachedProjects();
}

// Check if token is being stored in session storage
export function isUsingSessionStorage(): boolean {
  return sessionStorage.getItem("gitlab_token") !== null;
}

// Project caching functions
interface CachedProject {
  id: number;
  name: string;
  description: string | null;
  web_url: string;
  avatar_url: string | null;
  namespace: {
    name: string;
  };
  default_branch: string;
  visibility: string;
  last_updated: number; // Timestamp when cached
}

// Cache projects to local storage (only non-sensitive data)
export function cacheProjects(
  projects: CachedProject[],
  ttl: number = 24 * 60 * 60 * 1000,
): void {
  try {
    // TTL is in milliseconds (default 24 hours)
    const expiresAt = Date.now() + ttl;
    const data = {
      projects,
      expiresAt,
    };
    localStorage.setItem("gitlab_projects_cache", JSON.stringify(data));
  } catch (error) {
    console.error("Failed to cache projects:", error);
    // If storage fails (quota exceeded), clear it and try again
    try {
      localStorage.removeItem("gitlab_projects_cache");
    } catch (e) {
      // Silent fail if can't even remove
    }
  }
}

// Get cached projects
export function getCachedProjects(): CachedProject[] | null {
  try {
    const cachedData = localStorage.getItem("gitlab_projects_cache");
    if (!cachedData) return null;

    const data = JSON.parse(cachedData);

    // Check if cache has expired
    if (data.expiresAt < Date.now()) {
      localStorage.removeItem("gitlab_projects_cache");
      return null;
    }

    return data.projects;
  } catch (error) {
    console.error("Failed to retrieve cached projects:", error);
    return null;
  }
}

// Clear cached projects
export function clearCachedProjects(): void {
  try {
    localStorage.removeItem("gitlab_projects_cache");
  } catch (error) {
    console.error("Failed to clear project cache:", error);
  }
}
