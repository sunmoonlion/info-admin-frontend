import { requestJson } from '@/lib/api/client'

export interface InfoDocument {
  id: string
  source_id?: string | null
  canonical_url?: string | null
  title: string
  source_name?: string | null
  published_at?: string | null
  status: string
  current_version_id?: string | null
  content_hash?: string | null
  metadata_json: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface InfoDocumentVersion {
  id: string
  document_id: string
  version_no: number
  source_url: string
  title: string
  content_hash: string
  extraction_status: string
  created_at: string
  updated_at: string
}

export interface InfoDistribution {
  id: string
  document_id: string
  document_version_id: string
  target_app: string
  target_dataset?: string | null
  content_hash: string
  status: string
  payload: Record<string, unknown>
  last_error?: string | null
  created_at: string
  updated_at: string
}

export interface InfoSource {
  id: string
  code: string
  name: string
  source_type: string
  base_url?: string | null
  status: string
  trust_level: string
  copyright_status: string
  license_url?: string | null
  terms_url?: string | null
  description?: string | null
  created_at: string
  updated_at: string
}

export interface InfoCollector {
  id: string
  source_id?: string | null
  code: string
  name: string
  collector_type: string
  config: Record<string, unknown>
  status: string
  created_at: string
  updated_at: string
}

export interface InfoUploadReceipt {
  document_version_id: string
  document_id: string
  extraction_status: string
  raw_artifact_id?: string | null
  clean_artifact_id?: string | null
  text_artifact_id?: string | null
}

export interface InfoDocumentFilters {
  keyword?: string
  status?: string
}

function queryString<T extends object>(values: T): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(values)) {
    if (typeof value === 'string' && value) params.set(key, value)
  }
  const encoded = params.toString()
  return encoded ? `?${encoded}` : ''
}

export const infoApi = {
  listDocuments(filters: InfoDocumentFilters = {}) {
    return requestJson<InfoDocument[]>(`/api/documents${queryString(filters)}`)
  },

  listVersions(documentId: string) {
    return requestJson<InfoDocumentVersion[]>(`/api/documents/${documentId}/versions`)
  },

  listDistributions(versionId: string, status?: string) {
    return requestJson<InfoDistribution[]>(
      `/api/admin/distributions${queryString({
        document_version_id: versionId,
        status,
      })}`,
    )
  },

  createCrawlJob(
    input: { target_url: string; source_id?: string; enqueue: boolean },
    csrfToken?: string,
  ) {
    return requestJson<unknown>('/api/admin/crawl-jobs', {
      method: 'POST',
      csrfToken,
      body: input,
    })
  },

  createSource(
    input: {
      code: string
      name: string
      source_type: string
      base_url?: string
      trust_level: string
      copyright_status: string
      license_url?: string
      terms_url?: string
    },
    csrfToken?: string,
  ) {
    return requestJson<InfoSource>('/api/admin/sources', {
      method: 'POST',
      csrfToken,
      body: input,
    })
  },

  createCollector(
    input: {
      code: string
      name: string
      collector_type: string
      source_id?: string
      config: Record<string, unknown>
    },
    csrfToken?: string,
  ) {
    return requestJson<InfoCollector>('/api/admin/collectors', {
      method: 'POST',
      csrfToken,
      body: input,
    })
  },

  discoverCollector(collectorId: string, url?: string, csrfToken?: string) {
    return requestJson<unknown>(`/api/admin/collectors/${collectorId}/discover`, {
      method: 'POST',
      csrfToken,
      body: url ? { url } : {},
    })
  },

  async uploadDocument(file: File, title?: string, csrfToken?: string) {
    const body = new FormData()
    body.append('file', file)
    if (title) body.append('title', title)
    const response = await fetch('/api/admin/uploads', {
      method: 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: csrfToken ? { 'X-CSRF-Token': csrfToken } : undefined,
      body,
    })
    if (!response.ok) {
      throw new Error(`upload failed: ${response.status}`)
    }
    return (await response.json()) as InfoUploadReceipt
  },

  reviewDocument(
    documentId: string,
    input: { status: string; reason: string; expected_updated_at?: string },
    csrfToken?: string,
  ) {
    return requestJson<InfoDocument>(`/api/documents/${documentId}/review`, {
      method: 'POST',
      csrfToken,
      body: input,
    })
  },

  updateEntityLinks(
    documentId: string,
    input: {
      companies: string[]
      securities: string[]
      industries: string[]
      topics: string[]
      reason?: string
      expected_updated_at?: string
    },
    csrfToken?: string,
  ) {
    return requestJson<InfoDocument>(`/api/documents/${documentId}/entity-links`, {
      method: 'POST',
      csrfToken,
      body: input,
    })
  },

  updateSummaryProfile(
    documentId: string,
    input: {
      summary?: string
      tags: string[]
      importance_score?: number
      importance_reason?: string
      reason?: string
      expected_updated_at?: string
    },
    csrfToken?: string,
  ) {
    return requestJson<InfoDocument>(`/api/documents/${documentId}/summary-profile`, {
      method: 'POST',
      csrfToken,
      body: input,
    })
  },

  createDistribution(documentVersionId: string, targetDataset?: string, csrfToken?: string) {
    return requestJson<InfoDistribution>('/api/admin/distributions/knowledge', {
      method: 'POST',
      csrfToken,
      body: {
        document_version_id: documentVersionId,
        target_dataset: targetDataset || null,
        dispatch: false,
      },
    })
  },

  dispatchDistribution(distributionId: string, csrfToken?: string) {
    return requestJson<InfoDistribution>(`/api/admin/distributions/${distributionId}/dispatch`, {
      method: 'POST',
      csrfToken,
    })
  },

  retryDistribution(distributionId: string, csrfToken?: string) {
    return requestJson<InfoDistribution>(`/api/admin/distributions/${distributionId}/retry`, {
      method: 'POST',
      csrfToken,
    })
  },
}
