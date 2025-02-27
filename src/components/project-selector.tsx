"use client";

import { api } from "@/lib/api-client";
import type { GitLabProject, MergeRequestResponse } from "@/types/gitlab";
import { useState } from "react";
import { toast } from "sonner";

interface ProjectSelectorProps {
  projects: GitLabProject[];
  selectedProjectIds: number[];
  onSelectProjects: (projectIds: number[]) => void;
  isLoading?: boolean;
  mergeRequestChecks?: Record<
    number,
    {
      projectId: number;
      hasMergeRequest: boolean;
      mergeRequest?: MergeRequestResponse;
    }
  >;
  token?: string | null;
  sourceBranch?: string;
  onMergeRequestClosed?: () => void;
}

export function ProjectSelector({
  projects,
  selectedProjectIds,
  onSelectProjects,
  isLoading = false,
  mergeRequestChecks = {},
  token = null,
  sourceBranch = "",
  onMergeRequestClosed,
}: ProjectSelectorProps) {
  const [selectAll, setSelectAll] = useState(false);
  const [filter, setFilter] = useState("");
  const [closingMR, setClosingMR] = useState<number | null>(null);

  const filteredProjects = filter
    ? projects.filter(
        (project) =>
          project.name.toLowerCase().includes(filter.toLowerCase()) ||
          project.namespace.name.toLowerCase().includes(filter.toLowerCase()),
      )
    : projects;

  const handleCloseMergeRequest = async (
    e: React.MouseEvent,
    projectId: number,
    mrIid: number,
  ) => {
    e.stopPropagation();
    if (!token) return;

    try {
      setClosingMR(projectId);
      await api.closeMergeRequest(projectId, mrIid);
      toast.success("Merge request closed successfully");
      if (onMergeRequestClosed) {
        onMergeRequestClosed();
      }
    } catch (error) {
      toast.error(
        "Failed to close merge request: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    } finally {
      setClosingMR(null);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      // If we're currently selecting all, deselect all
      onSelectProjects([]);
      setSelectAll(false);
    } else {
      // Select all filtered projects that don't have open MRs
      const projectIds = filteredProjects
        .filter((project) => !mergeRequestChecks[project.id]?.hasMergeRequest)
        .map((project) => project.id);
      onSelectProjects(projectIds);
      setSelectAll(true);
    }
  };

  const handleToggleProject = (projectId: number) => {
    // Don't allow selecting projects with open MRs
    if (mergeRequestChecks[projectId]?.hasMergeRequest) {
      return;
    }

    const newSelection = selectedProjectIds.includes(projectId)
      ? selectedProjectIds.filter((id) => id !== projectId)
      : [...selectedProjectIds, projectId];

    onSelectProjects(newSelection);

    // Only count projects without MRs for "select all" logic
    const selectableProjects = filteredProjects.filter(
      (project) => !mergeRequestChecks[project.id]?.hasMergeRequest,
    );
    setSelectAll(newSelection.length === selectableProjects.length);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:max-w-md">
          <input
            type="text"
            placeholder="Filter projects..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            disabled={isLoading}
            className="w-full px-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-70"
          />
          {filter && (
            <button
              type="button"
              onClick={() => setFilter("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {selectedProjectIds.length} of {filteredProjects.length} selected
          </div>
          <button
            onClick={handleSelectAll}
            disabled={isLoading || filteredProjects.length === 0}
            className="px-3 py-1 text-sm border border-input rounded hover:bg-accent disabled:opacity-50"
          >
            {selectAll ? "Deselect All" : "Select All"}
          </button>
        </div>
      </div>

      <div className="border border-border rounded-md overflow-hidden">
        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full mx-auto mb-2"></div>
              <p className="text-muted-foreground">Loading projects...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {filter
                ? `No projects matching "${filter}"`
                : "No projects available"}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-muted sticky top-0">
                <tr>
                  <th className="p-3 text-left w-10">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      disabled={filteredProjects.length === 0}
                      className="h-4 w-4 rounded border-input text-primary focus:ring-primary/50"
                    />
                  </th>
                  <th className="p-3 text-left">Project</th>
                  <th className="p-3 text-left hidden md:table-cell">
                    Namespace
                  </th>
                  <th className="p-3 text-left hidden sm:table-cell">
                    Default Branch
                  </th>
                  <th className="p-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => {
                  const hasMR = mergeRequestChecks[project.id]?.hasMergeRequest;
                  const mergeRequest =
                    mergeRequestChecks[project.id]?.mergeRequest;
                  const isClosing = closingMR === project.id;

                  return (
                    <tr
                      key={project.id}
                      className={`border-t border-border hover:bg-muted/20 cursor-pointer ${hasMR ? "opacity-80 bg-red-50/20" : ""}`}
                      onClick={() => handleToggleProject(project.id)}
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedProjectIds.includes(project.id)}
                          onChange={() => handleToggleProject(project.id)}
                          onClick={(e) => e.stopPropagation()}
                          disabled={hasMR}
                          className="h-4 w-4 rounded border-input text-primary focus:ring-primary/50 disabled:opacity-50"
                        />
                      </td>
                      <td className="p-3">
                        <div className="font-medium truncate max-w-[200px]">
                          {project.name}
                        </div>
                      </td>
                      <td className="p-3 hidden md:table-cell text-muted-foreground truncate max-w-[200px]">
                        {project.namespace.name}
                      </td>
                      <td className="p-3 hidden sm:table-cell">
                        <span className="inline-block px-2 py-1 text-xs bg-accent/50 rounded">
                          {project.default_branch || "main"}
                        </span>
                      </td>
                      <td className="p-3">
                        {hasMR ? (
                          <div className="flex items-center gap-2">
                            <span className="inline-block px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                              MR exists
                            </span>
                            {mergeRequest && (
                              <button
                                onClick={(e) =>
                                  handleCloseMergeRequest(
                                    e,
                                    project.id,
                                    mergeRequest.iid,
                                  )
                                }
                                disabled={isClosing}
                                className="inline-flex items-center justify-center px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-70"
                              >
                                {isClosing ? "Closing..." : "Close MR"}
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                            Ready
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
