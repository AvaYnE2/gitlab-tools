import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { routes } from "./routes";
import "dotenv/config";

const PORT = process.env.PORT ? Number.parseInt(process.env.PORT) : 3010;

// Create the application
const app = new Elysia()
  .use(
    swagger({
      path: "/swagger",
      documentation: {
        info: {
          title: "GitLab MR API",
          version: "1.0.0",
          description: "API for managing GitLab merge requests",
        },
      },
    }),
  )

  .use(
    cors({
      origin: "*",
    }),
  )
  // Add routes
  .use(routes)
  // Add a simple health check
  .get("/", () => ({ status: "ok" }))
  // Start the server
  .listen(PORT);

console.log(
  `🦊 GitLab MR server is running at ${app.server?.hostname}:${app.server?.port}`,
);

// For Bun hot reloading
export type App = typeof app;
