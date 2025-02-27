/**
 * Utility functions for token storage in browser
 */

// Save token to storage (local or session)
export function saveToken(token: string, useSessionStorage: boolean): void {
  console.log("saveToken", token, useSessionStorage);
  if (useSessionStorage) {
    sessionStorage.setItem("gitlab_token", token);
    localStorage.removeItem("gitlab_token"); // Clear from local storage if exists
  } else {
    localStorage.setItem("gitlab_token", token);
    sessionStorage.removeItem("gitlab_token"); // Clear from session storage if exists
  }
}

// Get token from storage (checks both local and session)
export function getToken(): string | null {
  return (
    localStorage.getItem("gitlab_token") ||
    sessionStorage.getItem("gitlab_token")
  );
}

// Clear token from all storage locations
export function clearToken(): void {
  localStorage.removeItem("gitlab_token");
  sessionStorage.removeItem("gitlab_token");
}

// Check if token is being stored in session storage
export function isUsingSessionStorage(): boolean {
  return sessionStorage.getItem("gitlab_token") !== null;
}
