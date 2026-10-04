'use client'

import { useFormatter, useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useState } from 'react'

import type { AdminRequest } from '@/contracts/security-intake'

import { IntakeError } from '../api/http'
import { useHandledRequests, useOpenRequests, useRequestDecisions } from '../api/intake'
import {
  decidedBySystem,
  earliest,
  handled,
  noteProblem,
  pendingFirstCome,
  wanting,
} from '../model/intake'
import { NoteDialog } from './note-dialog'

type Notice = { tone: 'ok' | 'error'; text: string }

// 申请审批：待批准的在上面，一家公司一行；已处理的在下面，可按状态筛。
export function RequestApprovals({ csrfToken }: { csrfToken: string }) {
  const t = useTranslations('intake.requests')
  const tc = useTranslations('intake.common')
  const tp = useTranslations('intake.progress')
  const format = useFormatter()
  const locale = useLocale()
  const [status, setStatus] = useState('')
  const [rejecting, setRejecting] = useState<AdminRequest | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)
  const open = useOpenRequests()
  const done = useHandledRequests(status)
  const act = useRequestDecisions(csrfToken)
  const when = (at: string | null) =>
    at ? format.dateTime(new Date(at), { dateStyle: 'medium', timeStyle: 'short' }) : '—'
  const failed = (error: unknown) => {
    const code = error instanceof IntakeError ? error.code : 'other'
    setNotice({
      tone: 'error',
      text: t.has(`problem.${code}`) ? t(`problem.${code}`) : t('problem.other'),
    })
  }

  async function approve(request: AdminRequest, addToWatchlist: boolean) {
    setNotice(null)
    try {
      await act.approve.mutateAsync({ id: request.id, addToWatchlist })
      setNotice({
        tone: 'ok',
        text: t(addToWatchlist ? 'done.watched' : 'done.approved', { code: request.security_code }),
      })
    } catch (error) {
      failed(error)
    }
  }

  const pending = pendingFirstCome(open.data ?? [])
  const busy = act.approve.isPending || act.reject.isPending

  return (
    <div className="space-y-6">
      {notice ? (
        <p
          role={notice.tone === 'error' ? 'alert' : 'status'}
          className={notice.tone === 'error' ? 'crud-error' : 'reference-notice'}
        >
          {notice.text}
        </p>
      ) : null}

      <section className="reference-card" aria-label={t('pending')}>
        <h2>{t('pending')}</h2>
        {open.isPending ? <p className="crud-state">{tc('loading')}</p> : null}
        {open.isError ? <p className="crud-error">{tc('failed')}</p> : null}
        {open.data && pending.length === 0 ? (
          <p className="crud-state">{t('nonePending')}</p>
        ) : null}
        <ul className="divide-y">
          {pending.map((request) => (
            <li key={request.id} className="space-y-2 py-4">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="font-mono text-lg font-semibold">{request.security_code}</span>
                <span className="text-sm">{t('wants', { n: wanting(request).length })}</span>
                <span className="text-muted-foreground text-sm">
                  {t('earliest')}：{when(earliest(request))}
                </span>
              </div>
              <div className="text-sm">
                <p className="text-muted-foreground text-xs font-medium">{t('reasons')}</p>
                <ul className="mt-1 space-y-1">
                  {wanting(request).map((each) => (
                    <li key={each.actor_id}>
                      {each.reason ?? (
                        <span className="text-muted-foreground">{t('noReason')}</span>
                      )}
                      {each.origin ? (
                        <span className="text-muted-foreground">
                          {' '}
                          · {t('from', { app: each.origin.app })}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-muted-foreground text-sm">
                {t('reference')}：{request.in_watchlist ? t('inWatchlist') : t('notInWatchlist')}；
                {request.dataset
                  ? t('hasData', {
                      version: request.dataset.data_version.slice(-8),
                      end: request.dataset.end_date,
                    })
                  : t('noData')}
                {' · '}
                <Link
                  href={`/${locale}/info/securities?code=${request.security_code}`}
                  className="underline underline-offset-2"
                >
                  {t('toSecurities')}
                </Link>
              </p>
              <div className="reference-actions">
                <button
                  type="button"
                  className="primary-button"
                  disabled={busy}
                  onClick={() => void approve(request, false)}
                >
                  {t('approve')}
                </button>
                {request.in_watchlist ? null : (
                  <button
                    type="button"
                    className="secondary-button"
                    disabled={busy}
                    onClick={() => void approve(request, true)}
                  >
                    {t('approveAndWatch')}
                  </button>
                )}
                <button
                  type="button"
                  className="secondary-button"
                  disabled={busy}
                  onClick={() => setRejecting(request)}
                >
                  {t('reject')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="reference-card" aria-label={t('handled')}>
        <h2>{t('handled')}</h2>
        <div className="schema-field md:w-56">
          <label htmlFor="handled-status">{t('filter')}</label>
          <select
            id="handled-status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">{t('all')}</option>
            <option value="approved">{t('status.approved')}</option>
            <option value="rejected">{t('status.rejected')}</option>
            <option value="withdrawn">{t('status.withdrawn')}</option>
          </select>
        </div>
        {done.isPending ? <p className="crud-state">{tc('loading')}</p> : null}
        {done.isError ? <p className="crud-error">{tc('failed')}</p> : null}
        <div className="crud-table-wrap">
          <table className="crud-table">
            <caption className="sr-only">{t('handled')}</caption>
            <thead>
              <tr>
                <th>{tc('code')}</th>
                <th>{t('filter')}</th>
                <th>{t('by')}</th>
                <th>{t('at')}</th>
                <th>{tc('note')}</th>
              </tr>
            </thead>
            <tbody>
              {handled(done.data ?? []).map((request) => (
                <tr key={request.id}>
                  <td className="font-mono">{request.security_code}</td>
                  <td>{tp.has(request.progress) ? tp(request.progress) : request.progress}</td>
                  <td>{decidedBySystem(request) ? t('bySystem') : (request.decided_by ?? '—')}</td>
                  <td>{when(request.decided_at ?? request.closed_at)}</td>
                  <td>{request.decision_note ?? '—'}</td>
                </tr>
              ))}
              {done.data && handled(done.data).length === 0 ? (
                <tr>
                  <td colSpan={5}>{t('noneHandled')}</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {rejecting ? (
        <NoteDialog
          title={t('rejectTitle', { code: rejecting.security_code })}
          label={t('rejectLabel')}
          confirmLabel={t('rejectConfirm')}
          cancelLabel={tc('cancel')}
          required
          problem={(note) => {
            const wrong = noteProblem(note)
            return wrong === 'required'
              ? t('noteRequired')
              : wrong === 'too_long'
                ? t('noteTooLong')
                : null
          }}
          onClose={() => setRejecting(null)}
          onConfirm={async (note) => {
            setNotice(null)
            try {
              await act.reject.mutateAsync({ id: rejecting.id, note })
              setNotice({ tone: 'ok', text: t('done.rejected', { code: rejecting.security_code }) })
              setRejecting(null)
            } catch (error) {
              failed(error)
              setRejecting(null)
            }
          }}
        />
      ) : null}
    </div>
  )
}
