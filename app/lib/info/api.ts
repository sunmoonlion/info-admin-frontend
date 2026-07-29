'use client'

import { requestJson } from '@/lib/api/client'

export type InfoDocument = {
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

export type InfoDocumentFilters = {
  keyword?: string
  status?: string
}

function queryString(values: Record<string, string | undefined>): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(values)) {
    if (value) params.set(key, value)
  }
  const encoded = params.toString()
  return encoded ? `?${encoded}` : ''
}

export const infoApi = {
  listDocuments(filters: InfoDocumentFilters = {}) {
    return requestJson<InfoDocument[]>(`/api/documents${queryString(filters)}`)
  },

  createCrawlJob(
    input: { target_url: string; source_id?: string; enqueue: boolean },
    csrfToken?: string,
  ) {
    return requestJson<unknown>('/api/admin/crawl-jobs', {
      method: 'POST',
      body: input,
      csrfToken,
    })
  },
}
