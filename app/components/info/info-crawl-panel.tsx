'use client'

import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'

import { infoApi, type InfoDocument } from '@/lib/info-api'

function errorText(error: unknown): string {
  if (error instanceof Error) return error.message
  return 'Request failed'
}

export function InfoCrawlPanel() {
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState('')
  const [targetUrl, setTargetUrl] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const filters = useMemo(
    () => ({
      keyword: keyword.trim() || undefined,
      status: status.trim() || undefined,
    }),
    [keyword, status],
  )

  const documentsQuery = useQuery({
    queryKey: ['info-documents', filters],
    queryFn: () => infoApi.listDocuments(filters),
  })

  async function onCreateCrawl() {
    setMessage(null)
    try {
      await infoApi.createCrawlJob({
        target_url: targetUrl.trim(),
        enqueue: true,
      })
      setMessage('Crawl job accepted')
      setTargetUrl('')
      await documentsQuery.refetch()
    } catch (error) {
      setMessage(errorText(error))
    }
  }

  const rows: InfoDocument[] = documentsQuery.data ?? []

  return (
    <div className="reference-grid">
      <section className="reference-card">
        <h2>Create crawl job</h2>
        <div className="schema-field">
          <label htmlFor="info-crawl-url">Target URL</label>
          <input
            id="info-crawl-url"
            placeholder="https://example.com/article"
            value={targetUrl}
            onChange={(event) => setTargetUrl(event.target.value)}
          />
        </div>
        <div className="reference-actions">
          <button
            type="button"
            className="primary-button"
            disabled={!targetUrl.trim()}
            onClick={() => void onCreateCrawl()}
          >
            Enqueue
          </button>
        </div>
        {message ? <p className="reference-notice">{message}</p> : null}
      </section>

      <section className="reference-card reference-wide">
        <h2>Documents</h2>
        <div className="reference-actions">
          <div className="schema-field flex-1">
            <label htmlFor="info-crawl-keyword">Keyword</label>
            <input
              id="info-crawl-keyword"
              placeholder="Keyword"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
          </div>
          <div className="schema-field md:w-48">
            <label htmlFor="info-crawl-status">Status</label>
            <input
              id="info-crawl-status"
              placeholder="Status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            />
          </div>
        </div>
        {documentsQuery.isLoading ? <p className="crud-state">Loading…</p> : null}
        {documentsQuery.error ? (
          <p className="crud-error">{errorText(documentsQuery.error)}</p>
        ) : null}
        <div className="crud-table-wrap">
          <table className="crud-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Source</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.title}</td>
                  <td>{row.status}</td>
                  <td>{row.source_name || '-'}</td>
                  <td>{row.updated_at}</td>
                </tr>
              ))}
              {!documentsQuery.isLoading && rows.length === 0 ? (
                <tr>
                  <td colSpan={4}>No documents</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">
          Full Ant Design crawl console archived under docs/p0-009b-domain-keep for
          parity follow-up.
        </p>
      </section>
    </div>
  )
}
