"use client";

import type { MultiMergeRequestResult } from "@/types/gitlab";
import { useEffect, useRef } from "react";

interface MergeRequestResultsProps {
  results: MultiMergeRequestResult[];
  inProgress: boolean;
  onClose: () => void;
}

export function MergeRequestResults({
  results,
  inProgress,
  onClose,
}: MergeRequestResultsProps) {
  const resultsRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when new results come in
  useEffect(() => {
    if (resultsRef.current && inProgress) {
      resultsRef.current.scrollTop = resultsRef.current.scrollHeight;
    }
  }, [results, inProgress]);

  // Count successes and failures
  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.filter((r) => !r.success).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card w-full max-w-2xl rounded-lg shadow-xl flex flex-col max-h-[80vh]">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h2 className="text-xl font-semibold">Merge Request Results</h2>
          {!inProgress && (
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          )}
        </div>

        <div className="p-4 border-b border-border">
          <div className="flex gap-4">
            <div className="flex-1 bg-accent/30 p-3 rounded">
              <div className="text-sm text-muted-foreground">Success</div>
              <div className="text-2xl font-semibold">{successCount}</div>
            </div>
            <div className="flex-1 bg-destructive/10 p-3 rounded">
              <div className="text-sm text-muted-foreground">Failed</div>
              <div className="text-2xl font-semibold">{failureCount}</div>
            </div>
            <div className="flex-1 bg-muted p-3 rounded">
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="text-2xl font-semibold">{results.length}</div>
            </div>
          </div>
        </div>

        <div ref={resultsRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {results.length === 0 && inProgress && (
            <div className="text-center py-8 text-muted-foreground">
              Processing merge requests...
            </div>
          )}

          {results.map((result, index) => (
            <div
              key={index}
              className={`p-3 border rounded ${
                result.success
                  ? "border-primary/30 bg-primary/5"
                  : "border-destructive/30 bg-destructive/5"
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="font-medium truncate pr-4">
                  {result.projectName}
                </div>
                <div
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    result.success
                      ? "bg-primary/20 text-primary"
                      : "bg-destructive/20 text-destructive"
                  }`}
                >
                  {result.success ? "Success" : "Failed"}
                </div>
              </div>

              {result.success && result.mergeRequest && (
                <div className="mt-2">
                  <a
                    href={result.mergeRequest.web_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <span>View Merge Request #{result.mergeRequest.iid}</span>
                    <span className="text-xs">↗</span>
                  </a>
                </div>
              )}

              {!result.success && result.error && (
                <div className="mt-2 text-sm text-destructive">
                  {result.error}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-border">
          {inProgress ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full"></div>
              <span className="text-muted-foreground">
                Processing {results.length} of {results.length + 1}...
              </span>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
