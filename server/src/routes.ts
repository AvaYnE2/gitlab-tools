import { type Elysia, t } from "elysia";
import { controllers } from "./controllers";
import { withErrorHandling } from "./utils";

// Define routes with validation
export const routes = (app: Elysia) => {
  return (
    withErrorHandling(app)
      // Auth route
      .post(
        "/auth/validate",
        ({ body }) => controllers.validateToken(body.token),
        {
          body: t.Object({
            token: t.String(),
          }),
        },
      )

      // Projects routes
      .get(
        "/projects",
        ({ query, headers }) =>
          controllers.getProjects(
            headers.authorization as string,
            Number(query.page) || 1,
            Number(query.perPage) || 20,
            query.search || "",
          ),
        {
          query: t.Object({
            page: t.Optional(t.String()),
            perPage: t.Optional(t.String()),
            search: t.Optional(t.String()),
          }),
          headers: t.Object({
            authorization: t.Optional(t.String()),
          }),
        },
      )

      // Branches routes
      .get(
        "/projects/:id/branches",
        ({ params, headers }) =>
          controllers.getBranches(
            headers.authorization as string,
            Number(params.id),
          ),
        {
          params: t.Object({
            id: t.String(),
          }),
          headers: t.Object({
            authorization: t.Optional(t.String()),
          }),
        },
      )

      // Check branch exists
      .get(
        "/projects/:id/branches/:branchName/exists",
        ({ params, headers }) =>
          controllers.checkBranchExists(
            headers.authorization as string,
            Number(params.id),
            params.branchName,
          ),
        {
          params: t.Object({
            id: t.String(),
            branchName: t.String(),
          }),
          headers: t.Object({
            authorization: t.Optional(t.String()),
          }),
        },
      )

      // Merge requests routes
      .post(
        "/merge-requests/check",
        ({ body, headers }) =>
          controllers.checkMergeRequests(
            headers.authorization as string,
            body.projectIds,
            body.sourceBranch,
          ),
        {
          body: t.Object({
            projectIds: t.Array(t.Number()),
            sourceBranch: t.String(),
          }),
          headers: t.Object({
            authorization: t.Optional(t.String()),
          }),
        },
      )

      .post(
        "/merge-requests/create",
        ({ body, headers }) =>
          controllers.createMergeRequests(
            headers.authorization as string,
            body.projectIds,
            {
              sourceBranch: body.sourceBranch,
              targetBranch: body.targetBranch,
              title: body.title,
              description: body.description,
              removeSourceBranch: body.removeSourceBranch,
              squash: body.squash,
            },
          ),
        {
          body: t.Object({
            projectIds: t.Array(t.Number()),
            sourceBranch: t.String(),
            targetBranch: t.Union([
              t.String(),
              t.Record(t.String(), t.String()),
            ]),
            title: t.String(),
            description: t.Optional(t.String()),
            removeSourceBranch: t.Optional(t.Boolean()),
            squash: t.Optional(t.Boolean()),
          }),
          headers: t.Object({
            authorization: t.Optional(t.String()),
          }),
        },
      )

      .post(
        "/merge-requests/:projectId/:mergeRequestIid/close",
        ({ params, headers }) =>
          controllers.closeExistingMergeRequest(
            headers.authorization as string,
            Number(params.projectId),
            Number(params.mergeRequestIid),
          ),
        {
          params: t.Object({
            projectId: t.String(),
            mergeRequestIid: t.String(),
          }),
          headers: t.Object({
            authorization: t.Optional(t.String()),
          }),
        },
      )
      
      // Get all merge requests across all projects
      .get(
        "/merge-requests",
        ({ query, headers }) =>
          controllers.getAllMergeRequests(
            headers.authorization as string,
            query.state || "opened",
            query.scope || "created_by_me",
            Number(query.page) || 1,
            Number(query.perPage) || 20,
          ),
        {
          query: t.Object({
            state: t.Optional(t.String()),
            scope: t.Optional(t.String()),
            page: t.Optional(t.String()),
            perPage: t.Optional(t.String()),
          }),
          headers: t.Object({
            authorization: t.Optional(t.String()),
          }),
        },
      )
  );
};
