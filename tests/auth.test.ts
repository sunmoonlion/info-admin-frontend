import { afterEach, describe, expect, it, vi } from "vitest";

import { logout, requireUser, safeReturnTo } from "~/lib/auth";
import { queryClient } from "~/lib/query-client";
import {
  clearBrowserSession,
  getCsrfToken,
  setBrowserSession,
} from "~/lib/session";

describe("browser session contract", () => {
  afterEach(() => {
    clearBrowserSession();
    queryClient.clear();
    vi.restoreAllMocks();
  });

  it("rejects absolute and protocol-relative return URLs", () => {
    expect(safeReturnTo("https://evil.example")).toBe("/");
    expect(safeReturnTo("//evil.example")).toBe("/");
    expect(safeReturnTo("/reference?tab=one")).toBe("/reference?tab=one");
  });

  it("normalizes /api/auth/me and keeps CSRF only in memory", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          contract_version: 1,
          authenticated: true,
          user: {
            actor_id: "actor-1",
            app: "info",
            surface: "admin",
            display_name: "Alice",
            email: "alice@example.test",
            roles: ["admin"],
            scopes: ["info:read"],
            expires_at: "2026-07-14T12:00:00Z",
          },
          csrf_token: "csrf-token-that-remains-memory-only",
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );

    await expect(requireUser("/reference?tab=one")).resolves.toMatchObject({
      id: "actor-1",
      name: "Alice",
      roles: ["admin"],
      scopes: ["info:read"],
    });
    expect(getCsrfToken()).toBe("csrf-token-that-remains-memory-only");
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/auth/me"),
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("converges an unauthenticated session to login with a safe return path", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({}), { status: 401 }),
    );

    await expect(requireUser("/reference?tab=one")).rejects.toMatchObject({
      status: 302,
      headers: expect.any(Headers),
    });
  });

  it("logs out with POST and clears the in-memory CSRF token", async () => {
    setBrowserSession(
      { id: "actor-1", name: "Alice", roles: ["admin"], scopes: [] },
      "csrf-token",
    );
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 204 }));

    await logout();

    const [, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(request.method).toBe("POST");
    expect(new Headers(request.headers).get("X-CSRF-Token")).toBe("csrf-token");
    expect(getCsrfToken()).toBeUndefined();
  });
});
