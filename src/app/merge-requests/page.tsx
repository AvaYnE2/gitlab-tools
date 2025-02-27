"use client";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { useMergeRequests } from "@/hooks/use-merge-requests";
import { clearToken, getToken, isUsingSessionStorage } from "@/lib/storage";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";

type State = "opened" | "merged" | "closed" | "all";

export default function MergeRequestsPage() {
  // Token and authentication state
  const [token, setToken] = useState<string | null>(null);
  const [isSessionStorage, setIsSessionStorage] = useState(false);

  // State for filtering and pagination
  const [state, setState] = useState<State>("opened");
  const [page, setPage] = useState(1);
  const perPage = 20;

  // Load token on initial render
  useEffect(() => {
    const savedToken = getToken();
    if (savedToken) {
      setToken(savedToken);
      setIsSessionStorage(isUsingSessionStorage());
    }
  }, []);

  // Fetch merge requests
  const { data, isLoading, error } = useMergeRequests(
    state,
    "created_by_me",
    page,
    perPage,
    !!token,
  );

  // Handle state filter change
  const handleStateChange = (newState: State) => {
    setState(newState);
    setPage(1); // Reset to first page when filter changes
  };

  const handleLogout = () => {
    setToken(null);
    clearToken();
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
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
            <p>
              Please log in with your GitLab token to view your merge requests.
            </p>
            <Link
              href="/"
              className="text-blue-600 hover:underline mt-2 inline-block"
            >
              Go to login page
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-6">My Merge Requests</h1>

            {/* Filter controls */}
            <div className="flex flex-wrap gap-4 mb-6">
              <Button
                className={cn(
                  state === "opened"
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent hover:bg-accent/80 text-accent-foreground",
                  "hover:cursor-pointer",
                )}
                onClick={() => handleStateChange("opened")}
              >
                Open
              </Button>
              <Button
                className={cn(
                  state === "merged"
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent hover:bg-accent/80 text-accent-foreground",
                  "hover:cursor-pointer",
                )}
                onClick={() => handleStateChange("merged")}
              >
                Merged
              </Button>
              <Button
                className={cn(
                  state === "closed"
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent hover:bg-accent/80 text-accent-foreground",
                  "hover:cursor-pointer",
                )}
                onClick={() => handleStateChange("closed")}
              >
                Closed
              </Button>
              <Button
                className={cn(
                  state === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent hover:bg-accent/80 text-accent-foreground",
                  "hover:cursor-pointer",
                )}
                onClick={() => handleStateChange("all")}
              >
                All
              </Button>
            </div>

            {isLoading ? (
              <div className="animate-pulse flex flex-col gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="border border-border rounded-lg p-4">
                    <div className="h-4 bg-accent rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-accent rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-4 bg-destructive/10 border border-destructive text-destructive rounded-md">
                <p>
                  Error loading merge requests:{" "}
                  {error instanceof Error ? error.message : "Unknown error"}
                </p>
              </div>
            ) : (
              <>
                {/* Merge requests list */}
                <div className="flex flex-col gap-4">
                  {data?.mergeRequests && data.mergeRequests.length > 0 ? (
                    data.mergeRequests.map((mr) => (
                      <a
                        key={`${mr.project_id}-${mr.iid}`}
                        href={mr.web_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors flex flex-col gap-1"
                      >
                        <h3 className="font-medium text-lg">{mr.title}</h3>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">
                            {mr.project_name || `Project ${mr.project_id}`}
                          </span>{" "}
                          • MR !{mr.iid} • Created:{" "}
                          {new Date(mr.created_at).toLocaleDateString()}
                        </div>
                        <div className="mt-2">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              mr.state === "opened"
                                ? "bg-green-100 text-green-800"
                                : mr.state === "merged"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {mr.state}
                          </span>
                        </div>
                      </a>
                    ))
                  ) : (
                    <div className="text-center py-8 border border-border rounded-lg">
                      <p className="text-muted-foreground">
                        No merge requests found.
                      </p>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {data?.totalCount && data.totalCount > perPage && (
                  <div className="flex justify-center gap-2 mt-6">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className={`px-3 py-1 rounded ${page === 1 ? "bg-accent/50 text-muted-foreground" : "bg-accent hover:bg-accent/80"}`}
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1">
                      Page {page} of {Math.ceil(data.totalCount / perPage)}
                    </span>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page >= Math.ceil(data.totalCount / perPage)}
                      className={`px-3 py-1 rounded ${
                        page >= Math.ceil(data.totalCount / perPage)
                          ? "bg-accent/50 text-muted-foreground"
                          : "bg-accent hover:bg-accent/80"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>
      <Toaster position="top-right" />
    </div>
  );
}
