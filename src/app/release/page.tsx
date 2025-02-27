"use client";

import { Header } from "@/components/header";
import { MergeRequestForm } from "@/components/merge-request-form";
import { MergeRequestResults } from "@/components/merge-request-results";
import { ProjectSelector } from "@/components/project-selector";
import { TokenInput } from "@/components/token-input";
import { useCheckMergeRequests } from "@/hooks/use-check-merge-requests";
import { useCreateMergeRequests } from "@/hooks/use-create-merge-requests";
import { useGitLabProjects } from "@/hooks/use-gitlab-projects";
import {
  clearToken,
  getToken,
  isUsingSessionStorage,
  saveToken,
} from "@/lib/storage";
import {
  GitLabProject,
  type MergeRequestCreateParams,
  type MultiMergeRequestResult,
} from "@/types/gitlab";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";

export default function ReleasePage() {
  const [token, setToken] = useState<string | null>(null);
  const [isSessionStorage, setIsSessionStorage] = useState(false);
  const [selectedProjectIds, setSelectedProjectIds] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [mergeResults, setMergeResults] = useState<MultiMergeRequestResult[]>(
    [],
  );
  const [sourceBranch, setSourceBranch] = useState<string>("develop");

  // Fetch all projects the user has access to
  const {
    data: projectsData,
    isLoading: isLoadingProjects,
    isError,
    error,
    refetch,
  } = useGitLabProjects({
    token,
    page: 1,
    perPage: 100, // Get more projects at once for the release tool
    search: "",
  });

  // Get projects array from the response
  const projects = projectsData?.projects || [];

  // Check for existing merge requests
  const {
    data: mergeRequestChecks,
    isLoading: isCheckingMergeRequests,
    refetch: refetchMergeRequests,
  } = useCheckMergeRequests(projects, sourceBranch, token);

  // Setup merge request creation mutation
  const { mutate: createMergeRequests, isPending: isCreatingMergeRequests } =
    useCreateMergeRequests({
      token,
      onProgress: (result) => {
        setMergeResults((prev) => [...prev, result]);
      },
      onSuccess: () => {
        // Refresh MR status after all MRs are created
        refetchMergeRequests();
      },
    });

  // Load token on initial render
  useEffect(() => {
    const savedToken = getToken();
    if (savedToken) {
      setToken(savedToken);
      setIsSessionStorage(isUsingSessionStorage());
    }
  }, []);

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
  };

  const handleLogout = () => {
    setToken(null);
    clearToken();
    setSelectedProjectIds([]);
  };

  const handleCreateMergeRequests = (params: MergeRequestCreateParams) => {
    setMergeResults([]);
    setShowResults(true);
    setSourceBranch(params.sourceBranch);

    createMergeRequests({
      projectIds: selectedProjectIds,
      params,
    });
  };

  const handleMergeRequestClosed = () => {
    refetchMergeRequests();
  };

  const handleCloseResults = () => {
    setShowResults(false);
    setMergeResults([]);
    // Refresh MR status when results are closed
    refetchMergeRequests();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        hasToken={!!token}
        onLogout={handleLogout}
        storageType={isSessionStorage ? "session" : "local"}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!token ? (
          <TokenInput
            onTokenSubmit={handleTokenSubmit}
            isLoading={isLoadingProjects}
          />
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-6">
              Multi-Project Release Tool
            </h1>

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

            <div className="space-y-8">
              <section className="space-y-4">
                <h2 className="text-xl font-medium">1. Select Projects</h2>
                <p className="text-muted-foreground">
                  Choose the projects you want to create release merge requests
                  for. All projects should have the same branch structure.
                </p>

                <ProjectSelector
                  projects={projects}
                  selectedProjectIds={selectedProjectIds}
                  onSelectProjects={setSelectedProjectIds}
                  isLoading={isLoadingProjects || isCheckingMergeRequests}
                  mergeRequestChecks={mergeRequestChecks || {}}
                  token={token}
                  sourceBranch={sourceBranch}
                  onMergeRequestClosed={handleMergeRequestClosed}
                />
              </section>

              <section className="space-y-4">
                <h2 className="text-xl font-medium">
                  2. Configure Merge Request
                </h2>
                <p className="text-muted-foreground">
                  Set up the merge request details. Typically, releases merge
                  from develop to main.
                </p>

                <div className="bg-card border border-border rounded-lg p-4">
                  <MergeRequestForm
                    onSubmit={handleCreateMergeRequests}
                    isSubmitting={isCreatingMergeRequests}
                    projectsCount={selectedProjectIds.length}
                    defaultSourceBranch="develop"
                    defaultTargetBranch="main"
                    selectedProjects={projects.filter((p) =>
                      selectedProjectIds.includes(p.id),
                    )}
                    onSourceBranchChange={(branch) => setSourceBranch(branch)}
                  />
                </div>
              </section>
            </div>
          </>
        )}
      </main>

      {showResults && (
        <MergeRequestResults
          results={mergeResults}
          inProgress={isCreatingMergeRequests}
          onClose={handleCloseResults}
        />
      )}
      <Toaster position="top-right" />
    </div>
  );
}
