"use client";

import { Header } from "@/components/header";
import { Pagination } from "@/components/pagination";
import { ProjectCard } from "@/components/project-card";
import { ProjectSearch } from "@/components/project-search";
import { TokenInput } from "@/components/token-input";
import { useGitLabProjects } from "@/hooks/use-gitlab-projects";
import {
  clearToken,
  getToken,
  isUsingSessionStorage,
  saveToken,
} from "@/lib/storage";
import { useEffect, useState } from "react";

const perPage = 20;

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSessionStorage, setIsSessionStorage] = useState(false);

  // Load token on initial render
  useEffect(() => {
    const savedToken = getToken();
    if (savedToken) {
      setToken(savedToken);
      setIsSessionStorage(isUsingSessionStorage());
    }
  }, []);

  // Use the React Query hook for data fetching
  const {
    data: projectsData,
    totalPages,
    isLoading,
    isError,
    error,
    refetch,
  } = useGitLabProjects({
    token,
    page,
    perPage,
    search: searchTerm,
  });
  // Get projects array from the response
  const projects = projectsData?.projects || [];

  // Handle API errors, especially 401 (unauthorized)
  useEffect(() => {
    if (isError && error?.message?.includes("401")) {
      handleLogout();
    }
  }, [isError, error]);

  const handleTokenSubmit = (newToken: string, useSessionStorage: boolean) => {
    setToken(newToken);
    saveToken(newToken, useSessionStorage);
    setIsSessionStorage(useSessionStorage);
    setPage(1);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo(0, 0);
  };

  const handleLogout = () => {
    setToken(null);
    clearToken();
    setPage(1);
    setSearchTerm("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        hasToken={!!token}
        onLogout={handleLogout}
        storageType={isSessionStorage ? "session" : "local"}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold mb-8">GitLab Projects Browser</h1>

          {token && (
            <div className="flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-4 mb-6">
              <ProjectSearch onSearch={handleSearch} disabled={isLoading} />

              <div className="text-sm text-muted-foreground">
                {projects.length > 0 && (
                  <span>
                    Showing {projects.length} projects
                    {searchTerm ? ` matching "${searchTerm}"` : ""}
                  </span>
                )}
              </div>
            </div>
          )}
        </header>

        <main>
          {!token ? (
            <TokenInput
              onTokenSubmit={handleTokenSubmit}
              isLoading={isLoading}
            />
          ) : (
            <>
              {isError && error && (
                <div className="p-4 mb-6 bg-destructive/10 border border-destructive text-destructive rounded-md">
                  {error.message || "An error occurred"}
                  <button
                    onClick={() => refetch()}
                    className="ml-2 underline text-sm"
                  >
                    Try again
                  </button>
                </div>
              )}

              {isLoading && projects.length === 0 ? (
                <div className="flex justify-center items-center py-16">
                  <div className="text-center">
                    <p className="text-muted-foreground mb-2">
                      Loading projects...
                    </p>
                    <div className="animate-spin h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full mx-auto"></div>
                  </div>
                </div>
              ) : projects.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-card rounded-lg border border-border">
                  <p className="text-muted-foreground">
                    {searchTerm
                      ? `No projects found matching "${searchTerm}"`
                      : "No projects found"}
                  </p>
                </div>
              )}

              {!isLoading && projects.length > 0 && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  disabled={isLoading}
                />
              )}
            </>
          )}
        </main>
      </main>
    </div>
  );
}
