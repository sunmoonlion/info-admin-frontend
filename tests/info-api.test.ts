import { afterEach, describe, expect, it, vi } from "vitest";

import { clearBrowserSession, setBrowserSession } from "~/lib/session";
import { infoApi } from "~/lib/info-api";

describe("Info domain API adapter", () => {
  afterEach(() => {
    clearBrowserSession();
    vi.restoreAllMocks();
  });

  it("keeps Info endpoints under the explicit /api contract", async () => {
    setBrowserSession(
      { id: "actor-1", name: "Operator", roles: ["operator"], scopes: [] },
      "csrf-token",
    );
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify([]), { status: 200 }),
    );

    await infoApi.listDocuments({ keyword: "market news", status: "draft" });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/documents\?keyword=market\+news&status=draft$/),
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("uses multipart transport for upload and does not forge a JSON content type", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          document_version_id: "version-1",
          document_id: "document-1",
          extraction_status: "queued",
        }),
        { status: 200 },
      ),
    );

    await infoApi.uploadDocument(
      new File(["fixture"], "fixture.txt", { type: "text/plain" }),
      "Fixture document",
    );

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(request.body).toBeInstanceOf(FormData);
    expect(new Headers(request.headers).get("Content-Type")).toBeNull();
  });

  it("passes audit correlation headers to review mutations", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ id: "document-1" }), { status: 200 }),
    );

    await infoApi.reviewDocument(
      "document-1",
      {
        status: "reviewed",
        reason: "operator approved",
        expected_updated_at: "2026-07-14T10:00:00Z",
      },
      {
        "X-Correlation-ID": "corr-1",
        "X-Operation-ID": "op-1",
        "X-Audit-Reason": "operator approved",
      },
    );

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const headers = new Headers(request.headers);
    expect(headers.get("X-Correlation-ID")).toBe("corr-1");
    expect(headers.get("X-Operation-ID")).toBe("op-1");
    expect(headers.get("X-Audit-Reason")).toBe("operator approved");
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(JSON.parse(String(request.body))).toEqual({
      status: "reviewed",
      reason: "operator approved",
      expected_updated_at: "2026-07-14T10:00:00Z",
    });
  });
});
