import type { AuthUser } from "./auth";

// Browser session material is intentionally memory-only. The backend owns the
// HttpOnly session cookie; the CSRF token is returned by /api/auth/me and must
// never be persisted to localStorage, sessionStorage, or a UI store.
let currentUser: AuthUser | undefined;
let csrfToken: string | undefined;

export function setBrowserSession(user: AuthUser, token?: string): void {
  currentUser = user;
  csrfToken = token;
}

export function clearBrowserSession(): void {
  currentUser = undefined;
  csrfToken = undefined;
}

export function getBrowserSessionUser(): AuthUser | undefined {
  return currentUser;
}

export function getCsrfToken(): string | undefined {
  return csrfToken;
}
