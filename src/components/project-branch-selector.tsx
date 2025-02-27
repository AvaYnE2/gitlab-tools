"use client";

import type { GitLabProject } from "@/types/gitlab";
import { Search, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface ProjectBranchSelectorProps {
  selectedProjects: GitLabProject[];
  targetBranches: Record<number, string>;
  onBranchChange: (projectId: number, branch: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectBranchSelector({
  selectedProjects,
  targetBranches,
  onBranchChange,
  isOpen,
  onClose,
}: ProjectBranchSelectorProps) {
  const [filter, setFilter] = useState("");

  // Filter projects by name or namespace
  const filteredProjects = filter
    ? selectedProjects.filter(
        (project) =>
          project.name.toLowerCase().includes(filter.toLowerCase()) ||
          project.namespace.name.toLowerCase().includes(filter.toLowerCase()),
      )
    : selectedProjects;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configure Target Branches</DialogTitle>
        </DialogHeader>

        <div className="border-y border-border py-4 -mx-6 px-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Filter projects..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-9 pr-9"
            />
            {filter && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setFilter("")}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear filter</span>
              </Button>
            )}
          </div>
        </div>

        <div className="max-h-[50vh] overflow-y-auto -mx-6 px-0">
          <table className="w-full">
            <thead className="bg-muted sticky top-0 z-10">
              <tr>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                  Project
                </th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground hidden md:table-cell">
                  Namespace
                </th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                  Default Branch
                </th>
                <th className="p-3 text-left text-sm font-medium text-muted-foreground">
                  Target Branch
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-muted-foreground"
                  >
                    {filter
                      ? `No projects matching "${filter}"`
                      : "No projects selected"}
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="border-t border-border hover:bg-muted/50"
                  >
                    <td className="p-3">
                      <div className="font-medium truncate max-w-[200px]">
                        {project.name}
                      </div>
                    </td>
                    <td className="p-3 hidden md:table-cell text-muted-foreground truncate max-w-[200px]">
                      {project.namespace.name}
                    </td>
                    <td className="p-3">
                      <span className="inline-block px-2 py-1 text-xs bg-accent/50 rounded">
                        {project.default_branch || "main"}
                      </span>
                    </td>
                    <td className="p-3">
                      <select
                        value={
                          targetBranches[project.id] ||
                          project.default_branch ||
                          "main"
                        }
                        onChange={(e) =>
                          onBranchChange(project.id, e.target.value)
                        }
                        className="w-full px-2 py-1 border border-input rounded bg-background"
                      >
                        <option value="main">main</option>
                        <option value="master">master</option>
                        <option value="production">production</option>
                        <option value="release">release</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full sm:w-auto">
            Apply Branch Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
