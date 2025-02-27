import type { Elysia } from "elysia";

export function encryptToken(token: string) {
  return Bun.password.hashSync(token);
}

export function verifyToken(encryptedToken: string) {
  const token = process.env.GITLAB_TOKEN;
  if (!token) {
    throw new Error("No token found");
  }
  return Bun.password.verifySync(token, encryptedToken);
}

export function decryptToken(encryptedToken: string) {
  if (!encryptedToken) {
    throw new Error("No token found");
  }

  if (verifyToken(encryptedToken)) {
    const token = process.env.GITLAB_TOKEN;
    if (!token) {
      throw new Error("No token found");
    }
    return token;
  }

  return null;
}

// Error handling middleware
export function withErrorHandling<T extends Elysia>(app: T): T {
  return app.onError(({ code, error, set }) => {
    console.error(`[${code}] ${error.message}`);

    if (code === "NOT_FOUND") {
      set.status = 404;
      return { error: "Not found" };
    }

    if (code === "VALIDATION") {
      set.status = 400;
      return { error: "Validation error", details: error.message };
    }

    // Default error handler
    set.status = 500;
    return { error: "Internal server error", message: error.message };
  }) as T;
}
