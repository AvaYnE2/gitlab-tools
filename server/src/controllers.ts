import {
  branchExists,
  closeMergeRequest,
  createMultipleProjectsMergeRequests,
  fetchAllMergeRequests,
  fetchGitLabProjects,
  fetchOpenMergeRequests,
  fetchProjectBranches,
} from "./gitlab-api";
import { encryptToken } from "./utils";
import type { MergeRequestCheck } from "./types";

// Controller functions for API endpoints
export const controllers = {
  validateToken: async (token: string) => {
    try {
      // Try to fetch a single project to validate the token
      const encryptedToken = encryptToken(token);
      await fetchGitLabProjects(encryptedToken, 1, 1);
      return { success: true, token: encryptedToken };
    } catch (error) {
      console.error(error);
      return { success: false, error: "Invalid token" };
    }
  },

  getProjects: async (
    encryptedToken: string,
    page = 1,
    perPage = 20,
    search = "",
  ) => {
    if (!encryptedToken) {
      throw new Error("Authorization token is required");
    }
    return await fetchGitLabProjects(encryptedToken, page, perPage, search);
  },

  getBranches: async (encryptedToken: string, projectId: number) => {
    return await fetchProjectBranches(encryptedToken, projectId);
  },

  checkMergeRequests: async (
    encryptedToken: string,
    projectIds: number[],
    sourceBranch: string,
  ) => {
    const results: Record<number, MergeRequestCheck> = {};

    const checkPromises = projectIds.map(async (projectId) => {
      try {
        const mergeRequests = await fetchOpenMergeRequests(
          encryptedToken,
          projectId,
          sourceBranch,
        );
        results[projectId] = {
          projectId,
          hasMergeRequest: mergeRequests.length > 0,
          mergeRequest: mergeRequests.length > 0 ? mergeRequests[0] : undefined,
        };
      } catch (error) {
        results[projectId] = {
          projectId,
          hasMergeRequest: false,
        };
      }
    });

    await Promise.all(checkPromises);
    return results;
  },

  closeExistingMergeRequest: async (
    encryptedToken: string,
    projectId: number,
    mergeRequestIid: number,
  ) => {
    return await closeMergeRequest(encryptedToken, projectId, mergeRequestIid);
  },

  createMergeRequests: async (
    encryptedToken: string,
    projectIds: number[],
    params: {
      sourceBranch: string;
      targetBranch: string | Record<number, string>;
      title: string;
      description?: string;
      removeSourceBranch?: boolean;
      squash?: boolean;
    },
  ) => {
    return await createMultipleProjectsMergeRequests(
      encryptedToken,
      projectIds,
      params,
    );
  },

  checkBranchExists: async (
    encryptedToken: string,
    projectId: number,
    branchName: string,
  ) => {
    return {
      exists: await branchExists(encryptedToken, projectId, branchName),
    };
  },
  
  getAllMergeRequests: async (
    encryptedToken: string,
    state: string = "opened",
    scope: string = "created_by_me",
    page: number = 1,
    perPage: number = 20,
  ) => {
    return await fetchAllMergeRequests(encryptedToken, state, scope, page, perPage);
  },
};
