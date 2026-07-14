import { redirect } from "react-router";

import { apiRequest } from "./api";
import { appConfig } from "./config";
import { queryClient } from "./query-client";
import { queryKeys } from "./query-keys";
import { clearBrowserSession, setBrowserSession } from "./session";

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  app?: string;
  surface?: string;
  roles: string[];
  scopes: string[];
  expiresAt?: string;
}

interface MeResponse {
  contract_version: 1;
  authenticated: true;
  user: {
    actor_id: string;
    app: string;
    surface: string;
    display_name: string | null;
    email: string | null;
    roles: string[];
    scopes: string[];
    expires_at: string;
  };
  csrf_token: string;
}

function normalizeUser(response: MeResponse): AuthUser {
  return {
    id: response.user.actor_id,
    name:
      response.user.display_name ||
      response.user.email ||
      response.user.actor_id,
    email: response.user.email || undefined,
    app: response.user.app,
    surface: response.user.surface,
    roles: response.user.roles,
    scopes: response.user.scopes,
    expiresAt: response.user.expires_at,
  };
}

async function fetchCurrentUser(): Promise<AuthUser> {
  const response = await apiRequest<MeResponse>("/api/auth/me");
  if (response.contract_version !== 1 || !response.authenticated) {
    throw new Error("unsupported auth contract");
  }
  const user = normalizeUser(response);
  setBrowserSession(user, response.csrf_token);
  return user;
}

export const currentUserQueryOptions = {
  queryKey: queryKeys.session,
  queryFn: fetchCurrentUser,
  staleTime: 30_000,
  retry: false,
};

export function safeReturnTo(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export async function requireUser(returnTo = "/"): Promise<AuthUser> {
  if (appConfig.authMode === "demo" && import.meta.env.DEV) {
    const user = {
      id: "demo-admin",
      name: "Demo Admin",
      roles: ["admin"],
      scopes: ["admin"],
    };
    setBrowserSession(user);
    return user;
  }

  try {
    return await queryClient.ensureQueryData(currentUserQueryOptions);
  } catch {
    // Authentication failures converge on the product login route.
    clearBrowserSession();
  }
  const params = new URLSearchParams({ return_to: returnTo });
  throw redirect(`/login?${params.toString()}`);
}

export function loginUrl(returnTo = "/"): string {
  const params = new URLSearchParams({ return_to: safeReturnTo(returnTo) });
  return `${appConfig.apiUrl}/api/auth/login?${params.toString()}`;
}

export async function logout(): Promise<void> {
  try {
    await apiRequest<void>("/api/auth/logout", { method: "POST" });
  } finally {
    clearBrowserSession();
    queryClient.removeQueries({ queryKey: queryKeys.session });
  }
}
