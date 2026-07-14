import { appConfig } from "./config";
import { clearBrowserSession, getCsrfToken } from "./session";

export interface ApiErrorShape {
  code: string;
  message_key: string;
  retryable: boolean;
  correlation_id?: string;
  field_errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail: ApiErrorShape,
  ) {
    super(detail.message_key);
    this.name = "ApiError";
  }
}

export function isUnauthorizedError(error: unknown): error is ApiError {
  return error instanceof ApiError && error.status === 401;
}

export function isForbiddenError(error: unknown): error is ApiError {
  return error instanceof ApiError && error.status === 403;
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const method = (init?.method || "GET").toUpperCase();
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");
  if (
    init?.body !== undefined &&
    typeof init.body === "string" &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }
  if (!headers.has("X-Correlation-ID")) {
    headers.set("X-Correlation-ID", crypto.randomUUID());
  }
  if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
    const csrfToken = getCsrfToken();
    if (csrfToken) headers.set("X-CSRF-Token", csrfToken);
  }

  const response = await fetch(`${appConfig.apiUrl}${path}`, {
    ...init,
    credentials: "include",
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) clearBrowserSession();
    let detail: ApiErrorShape = {
      code: "http_error",
      message_key: `errors.http.${response.status}`,
      retryable: response.status >= 500,
      correlation_id: response.headers.get("x-correlation-id") || undefined,
    };
    try {
      detail = { ...detail, ...(await response.json()) };
    } catch {
      // Stable fallback intentionally ignores non-JSON error bodies.
    }
    throw new ApiError(response.status, detail);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
