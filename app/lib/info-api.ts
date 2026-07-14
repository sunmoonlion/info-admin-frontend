import { apiRequest } from "~/lib/api";

export interface InfoDocument {
  id: string;
  source_id?: string | null;
  canonical_url?: string | null;
  title: string;
  source_name?: string | null;
  published_at?: string | null;
  status: string;
  current_version_id?: string | null;
  content_hash?: string | null;
  metadata_json: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface InfoDocumentVersion {
  id: string;
  document_id: string;
  version_no: number;
  source_url: string;
  title: string;
  content_hash: string;
  extraction_status: string;
  created_at: string;
  updated_at: string;
}

export interface InfoDistribution {
  id: string;
  document_id: string;
  document_version_id: string;
  target_app: string;
  target_dataset?: string | null;
  content_hash: string;
  status: string;
  payload: Record<string, unknown>;
  last_error?: string | null;
  created_at: string;
  updated_at: string;
}

export interface InfoSource {
  id: string;
  code: string;
  name: string;
  source_type: string;
  base_url?: string | null;
  status: string;
  trust_level: string;
  copyright_status: string;
  license_url?: string | null;
  terms_url?: string | null;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export interface InfoCollector {
  id: string;
  source_id?: string | null;
  code: string;
  name: string;
  collector_type: string;
  config: Record<string, unknown>;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface InfoUploadReceipt {
  document_version_id: string;
  document_id: string;
  extraction_status: string;
  raw_artifact_id?: string | null;
  clean_artifact_id?: string | null;
  text_artifact_id?: string | null;
}

export interface InfoDocumentFilters {
  keyword?: string;
  status?: string;
}

function queryString<T extends object>(values: T): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (typeof value === "string" && value) params.set(key, value);
  }
  const encoded = params.toString();
  return encoded ? `?${encoded}` : "";
}

export const infoApi = {
  listDocuments(filters: InfoDocumentFilters = {}) {
    return apiRequest<InfoDocument[]>(
      `/api/documents${queryString(filters)}`,
    );
  },

  listVersions(documentId: string) {
    return apiRequest<InfoDocumentVersion[]>(
      `/api/documents/${documentId}/versions`,
    );
  },

  listDistributions(versionId: string, status?: string) {
    return apiRequest<InfoDistribution[]>(
      `/api/admin/distributions${queryString({
        document_version_id: versionId,
        status,
      })}`,
    );
  },

  createCrawlJob(input: {
    target_url: string;
    source_id?: string;
    enqueue: boolean;
  }) {
    return apiRequest<unknown>("/api/admin/crawl-jobs", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  createSource(input: {
    code: string;
    name: string;
    source_type: string;
    base_url?: string;
    trust_level: string;
    copyright_status: string;
    license_url?: string;
    terms_url?: string;
  }) {
    return apiRequest<InfoSource>("/api/admin/sources", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  createCollector(input: {
    code: string;
    name: string;
    collector_type: string;
    source_id?: string;
    config: Record<string, unknown>;
  }) {
    return apiRequest<InfoCollector>("/api/admin/collectors", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  discoverCollector(collectorId: string, url?: string) {
    return apiRequest<unknown>(
      `/api/admin/collectors/${collectorId}/discover`,
      {
        method: "POST",
        body: JSON.stringify(url ? { url } : {}),
      },
    );
  },

  uploadDocument(file: File, title?: string) {
    const body = new FormData();
    body.append("file", file);
    if (title) body.append("title", title);
    return apiRequest<InfoUploadReceipt>("/api/admin/uploads", {
      method: "POST",
      body,
    });
  },

  reviewDocument(
    documentId: string,
    input: { status: string; reason: string },
    headers?: HeadersInit,
  ) {
    return apiRequest<InfoDocument>(
      `/api/documents/${documentId}/review`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(input),
      },
    );
  },

  updateEntityLinks(
    documentId: string,
    input: {
      companies: string[];
      securities: string[];
      industries: string[];
      topics: string[];
      reason?: string;
    },
    headers?: HeadersInit,
  ) {
    return apiRequest<InfoDocument>(
      `/api/documents/${documentId}/entity-links`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(input),
      },
    );
  },

  updateSummaryProfile(
    documentId: string,
    input: {
      summary?: string;
      tags: string[];
      importance_score?: number;
      importance_reason?: string;
      reason?: string;
    },
    headers?: HeadersInit,
  ) {
    return apiRequest<InfoDocument>(
      `/api/documents/${documentId}/summary-profile`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(input),
      },
    );
  },

  createDistribution(
    documentVersionId: string,
    targetDataset?: string,
  ) {
    return apiRequest<InfoDistribution>("/api/admin/distributions/knowledge", {
      method: "POST",
      body: JSON.stringify({
        document_version_id: documentVersionId,
        target_dataset: targetDataset || null,
        dispatch: false,
      }),
    });
  },

  dispatchDistribution(distributionId: string, headers?: HeadersInit) {
    return apiRequest<InfoDistribution>(
      `/api/admin/distributions/${distributionId}/dispatch`,
      { method: "POST", headers },
    );
  },

  retryDistribution(distributionId: string, headers?: HeadersInit) {
    return apiRequest<InfoDistribution>(
      `/api/admin/distributions/${distributionId}/retry`,
      { method: "POST", headers },
    );
  },
};
