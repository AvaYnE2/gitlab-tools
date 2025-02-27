"use client";

import type { GitLabProject, MergeRequestCreateParams } from "@/types/gitlab";
import { GitPullRequest, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, type SubmitHandler, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProjectBranchSelector } from "./project-branch-selector";

interface MergeRequestFormProps {
  onSubmit: (params: MergeRequestCreateParams) => void;
  isSubmitting?: boolean;
  projectsCount: number;
  defaultSourceBranch?: string;
  defaultTargetBranch?: string;
  selectedProjects: GitLabProject[];
  onSourceBranchChange?: (branch: string) => void;
}

type FormValues = {
  sourceBranch: string;
  targetBranch: string;
  title: string;
  description: string;
  removeSourceBranch: boolean;
  squash: boolean;
  usePerProjectBranches: boolean;
};

export function MergeRequestForm({
  onSubmit,
  isSubmitting = false,
  projectsCount,
  defaultSourceBranch = "develop",
  defaultTargetBranch = "main",
  selectedProjects,
  onSourceBranchChange,
}: MergeRequestFormProps) {
  const [showBranchSelector, setShowBranchSelector] = useState(false);
  const [perProjectBranches, setPerProjectBranches] = useState<
    Record<number, string>
  >({});

  // Initialize react-hook-form
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      sourceBranch: defaultSourceBranch,
      targetBranch: defaultTargetBranch,
      title: `Release: ${defaultSourceBranch} → ${defaultTargetBranch}`,
      description: "",
      removeSourceBranch: false,
      squash: false,
      usePerProjectBranches: false,
    },
  });

  // Watch values to update dependent fields
  const sourceBranch = watch("sourceBranch");
  const targetBranch = watch("targetBranch");
  const usePerProjectBranches = watch("usePerProjectBranches");

  // Notify parent when source branch changes
  useEffect(() => {
    if (onSourceBranchChange) {
      onSourceBranchChange(sourceBranch);
    }
  }, [sourceBranch, onSourceBranchChange]);

  // Initialize per-project branches with project default branches
  useEffect(() => {
    const branchMap: Record<number, string> = {};
    selectedProjects.forEach((project) => {
      branchMap[project.id] = project.default_branch || defaultTargetBranch;
    });
    setPerProjectBranches(branchMap);
  }, [selectedProjects, defaultTargetBranch]);

  // Pre-fill title when source/target branch changes
  useEffect(() => {
    const newTitle = usePerProjectBranches
      ? `Release: ${sourceBranch} → Per-project targets`
      : `Release: ${sourceBranch} → ${targetBranch}`;

    setValue("title", newTitle);
  }, [sourceBranch, targetBranch, usePerProjectBranches, setValue]);

  const onFormSubmit: SubmitHandler<FormValues> = (data) => {
    onSubmit({
      sourceBranch: data.sourceBranch,
      targetBranch: data.usePerProjectBranches
        ? perProjectBranches
        : data.targetBranch,
      title: data.title,
      description: data.description,
      removeSourceBranch: data.removeSourceBranch,
      squash: data.squash,
    });
  };

  const handleBranchChange = (projectId: number, branch: string) => {
    setPerProjectBranches((prev) => ({
      ...prev,
      [projectId]: branch,
    }));
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sourceBranch">Source Branch (from)</Label>
            <Input
              id="sourceBranch"
              {...register("sourceBranch", {
                required: "Source branch is required",
              })}
              className={errors.sourceBranch ? "border-destructive" : ""}
              placeholder="develop"
            />
            {errors.sourceBranch && (
              <p className="text-destructive text-xs">
                {errors.sourceBranch.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetBranch">Target Branch (to)</Label>
            <div className="space-y-2">
              {!usePerProjectBranches ? (
                <Input
                  id="targetBranch"
                  {...register("targetBranch", {
                    required:
                      !usePerProjectBranches && "Target branch is required",
                  })}
                  className={errors.targetBranch ? "border-destructive" : ""}
                  placeholder="main"
                  disabled={usePerProjectBranches}
                />
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowBranchSelector(true)}
                  className="w-full justify-between"
                >
                  <span>Per-project target branches</span>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    Configure
                  </span>
                </Button>
              )}

              <div className="flex items-center space-x-2">
                <Controller
                  name="usePerProjectBranches"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="usePerProjectBranches"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={selectedProjects.length === 0}
                    />
                  )}
                />
                <Label
                  htmlFor="usePerProjectBranches"
                  className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Use different target branches per project
                </Label>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register("title", { required: "Title is required" })}
              className={errors.title ? "border-destructive" : ""}
              placeholder="Release: develop → main"
            />
            {errors.title && (
              <p className="text-destructive text-xs">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Release notes or other details..."
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <div className="flex items-center space-x-2">
          <Controller
            name="removeSourceBranch"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="removeSourceBranch"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label
            htmlFor="removeSourceBranch"
            className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Remove source branch when merged
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Controller
            name="squash"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="squash"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label
            htmlFor="squash"
            className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Squash commits when merged
          </Label>
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <Button
          type="submit"
          disabled={isSubmitting || projectsCount === 0}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Merge Requests...
            </>
          ) : (
            <>
              <GitPullRequest className="mr-2 h-4 w-4" />
              Create {projectsCount} Merge Request
              {projectsCount !== 1 ? "s" : ""}
            </>
          )}
        </Button>
      </div>

      {showBranchSelector && (
        <ProjectBranchSelector
          selectedProjects={selectedProjects}
          targetBranches={perProjectBranches}
          onBranchChange={handleBranchChange}
          isOpen={showBranchSelector}
          onClose={() => setShowBranchSelector(false)}
        />
      )}
    </form>
  );
}
