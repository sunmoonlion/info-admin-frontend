import {
  ApiError,
  apiRequest,
  isForbiddenError,
  isUnauthorizedError,
} from "~/lib/api";
import { clearBrowserSession, setBrowserSession } from "~/lib/session";

describe("apiRequest", () => {
  afterEach(() => clearBrowserSession());

  it("uses credentials and parses a successful response", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    await expect(apiRequest<{ ok: boolean }>("/api/example")).resolves.toEqual({
      ok: true,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/api/example"),
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("normalizes non-json failures without trusting response text", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("<script>unsafe</script>", {
        status: 503,
        headers: { "x-correlation-id": "corr-1" },
      }),
    );

    const error = await apiRequest("/api/example").catch(
      (reason: unknown) => reason,
    );
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 503,
      detail: { code: "http_error", retryable: true, correlation_id: "corr-1" },
    });
    expect(isUnauthorizedError(error)).toBe(false);
    expect(isForbiddenError(error)).toBe(false);
  });

  it("keeps authorization status semantics explicit", () => {
    const unauthorized = new ApiError(401, {
      code: "unauthorized",
      message_key: "errors.http.401",
      retryable: false,
    });
    const forbidden = new ApiError(403, {
      code: "forbidden",
      message_key: "errors.http.403",
      retryable: false,
    });
    expect(isUnauthorizedError(unauthorized)).toBe(true);
    expect(isForbiddenError(forbidden)).toBe(true);
  });

  it("adds the in-memory CSRF token only to unsafe requests", async () => {
    setBrowserSession(
      { id: "actor-1", name: "Alice", roles: ["admin"], scopes: [] },
      "csrf-token",
    );
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(
        async () => new Response(JSON.stringify({ ok: true }), { status: 200 }),
      );

    await apiRequest("/api/write", { method: "POST" });
    await apiRequest("/api/read");

    const postHeaders = new Headers(
      (fetchMock.mock.calls[0]?.[1] as RequestInit).headers,
    );
    const getHeaders = new Headers(
      (fetchMock.mock.calls[1]?.[1] as RequestInit).headers,
    );
    expect(postHeaders.get("X-CSRF-Token")).toBe("csrf-token");
    expect(getHeaders.get("X-CSRF-Token")).toBeNull();
  });

  it("marks JSON mutation bodies without changing multipart uploads", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation(
      async () => new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );

    await apiRequest("/api/write", {
      method: "POST",
      body: JSON.stringify({ value: "fixture" }),
    });
    const jsonHeaders = new Headers(
      (fetchMock.mock.calls[0]?.[1] as RequestInit).headers,
    );
    expect(jsonHeaders.get("Content-Type")).toBe("application/json");

    await apiRequest("/api/upload", {
      method: "POST",
      body: new FormData(),
    });
    const uploadHeaders = new Headers(
      (fetchMock.mock.calls[1]?.[1] as RequestInit).headers,
    );
    expect(uploadHeaders.get("Content-Type")).toBeNull();
  });
});
