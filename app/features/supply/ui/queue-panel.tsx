'use client'

import { useFormatter, useNow, useTranslations } from 'next-intl'
import { useState } from 'react'

import { useJob, useJobs, useQueue, useRequeue } from '../api/supply'
import { codeOf, hoursSince } from '../model/supply'
import { useErrorText } from './error-text'

const PROCESS_QUEUE = '_processing'

const STATUSES = ['', 'queued', 'running', 'waiting', 'failed', 'done'] as const

// 队列监控（0045 第 3.3 节）：各渠道排着、在跑、等着的作业，一天里成败几个，最近失败的
// 原因；点一个作业看每次尝试，等着的可以马上再排。暂停渠道在「来源目录」里做
export function QueuePanel({ csrfToken }: { csrfToken: string }) {
  const t = useTranslations('supply')
  const format = useFormatter()
  const now = useNow()
  const errorText = useErrorText()
  const queue = useQueue()
  const [status, setStatus] = useState<(typeof STATUSES)[number]>('')
  const jobs = useJobs(status)
  const [picked, setPicked] = useState<string | null>(null)
  const job = useJob(picked)
  const requeue = useRequeue(csrfToken)
  const [message, setMessage] = useState<string | null>(null)
  const when = (at: string | null) =>
    at ? format.dateTime(new Date(at), { dateStyle: 'medium', timeStyle: 'short' }) : '—'

  return (
    <div className="reference-grid">
      <section className="reference-card reference-wide" aria-label={t('queue.title')}>
        {queue.isPending ? <p className="crud-state">{t('loading')}</p> : null}
        {queue.isError ? (
          <p role="alert" className="crud-error">
            {t('failed')}
          </p>
        ) : null}
        {queue.data ? (
          <>
            <div className="crud-table-wrap">
              <table className="crud-table">
                <caption className="sr-only">{t('queue.title')}</caption>
                <thead>
                  <tr>
                    <th>{t('col.name')}</th>
                    <th>{t('col.status')}</th>
                    <th>{t('col.queued')}</th>
                    <th>{t('col.running')}</th>
                    <th>{t('col.waiting')}</th>
                    <th>{t('col.failedRecent')}</th>
                    <th>{t('col.doneRecent')}</th>
                    <th>{t('col.oldest')}</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.data.channels.map((c) => (
                    <tr key={c.channel_id}>
                      {/* 加工队列不是渠道（上传资料的加工），名字按界面语言写 */}
                      <td>{c.channel_id === PROCESS_QUEUE ? t('queue.processing') : c.name}</td>
                      <td>
                        {t(`status.${c.status}`)}
                        {c.consecutive_failures ? (
                          <span className="text-muted-foreground ml-1 text-xs">
                            {t('queue.failuresInRow', { n: c.consecutive_failures })}
                          </span>
                        ) : null}
                      </td>
                      <td>{c.queued}</td>
                      <td>{c.running}</td>
                      <td>{c.waiting}</td>
                      <td>{c.failed_recent}</td>
                      <td>{c.done_recent}</td>
                      <td>
                        {c.oldest_open_at
                          ? t('hours', { n: hoursSince(c.oldest_open_at, now) ?? 0 })
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground text-sm">
              {t('queue.tiers')}
              {queue.data.tiers.length
                ? queue.data.tiers
                    .map((x) => t('queue.tier', { tier: x.tier, n: x.open }))
                    .join('；')
                : t('queue.noOpen')}
            </p>
            {queue.data.failures.length ? (
              <>
                <h3>{t('queue.failuresTitle')}</h3>
                <ul className="text-sm">
                  {queue.data.failures.map((f) => (
                    <li key={`${f.channel_id}-${f.reason}`}>
                      <span className="font-mono">{f.channel_id}</span> · {f.reason || '—'} ×{' '}
                      {f.count}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </>
        ) : null}
      </section>

      <section className="reference-card reference-wide" aria-label={t('queue.jobsTitle')}>
        <h2>{t('queue.jobsTitle')}</h2>
        <div className="schema-field md:w-48">
          <label htmlFor="supply-job-status">{t('col.status')}</label>
          <select
            id="supply-job-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as (typeof STATUSES)[number])}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`jobStatus.${s || 'all'}`)}
              </option>
            ))}
          </select>
        </div>
        {message ? (
          <p role="status" className="reference-notice">
            {message}
          </p>
        ) : null}
        {jobs.data && jobs.data.length === 0 ? (
          <p className="crud-state">{t('queue.noJobs')}</p>
        ) : null}
        {jobs.data && jobs.data.length > 0 ? (
          <div className="crud-table-wrap">
            <table className="crud-table">
              <caption className="sr-only">{t('queue.jobsTitle')}</caption>
              <thead>
                <tr>
                  <th>{t('col.channel')}</th>
                  <th>{t('col.key')}</th>
                  <th>{t('col.status')}</th>
                  <th>{t('col.tier')}</th>
                  <th>{t('col.attempts')}</th>
                  <th>{t('col.waitingItems')}</th>
                  <th>{t('col.lastError')}</th>
                  <th>{t('col.createdAt')}</th>
                </tr>
              </thead>
              <tbody>
                {jobs.data.map((j) => (
                  <tr key={j.job_id}>
                    <td className="font-mono">{j.channel_id}</td>
                    <td>
                      <button
                        type="button"
                        className="font-mono text-xs underline"
                        onClick={() => setPicked(j.job_id)}
                      >
                        {[j.key.subject, j.key.doc_type, j.key.period_end, j.key.material_id]
                          .filter(Boolean)
                          .join(' · ')}
                      </button>
                    </td>
                    <td>{t(`jobStatus.${j.status}`)}</td>
                    <td>{j.tier}</td>
                    <td>{j.attempts}</td>
                    <td>{j.waiting_items}</td>
                    <td className="font-mono text-xs">{j.last_error ?? '—'}</td>
                    <td>{when(j.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        {job.data ? (
          <div>
            <h3>{t('queue.attemptsTitle')}</h3>
            <ul className="text-sm">
              {job.data.attempt_list.map((a, n) => (
                <li key={n}>
                  {when(a.started_at)} → {when(a.finished_at)} · {a.outcome ?? '—'}
                  {a.reason ? `（${a.reason}）` : ''}
                </li>
              ))}
            </ul>
            {job.data.status === 'queued' || job.data.status === 'waiting' ? (
              <button
                type="button"
                disabled={requeue.isPending}
                onClick={() =>
                  requeue.mutate(job.data.job_id, {
                    onSuccess: () => setMessage(t('queue.requeued')),
                    onError: (error) => setMessage(errorText(codeOf(error))),
                  })
                }
              >
                {t('queue.requeue')}
              </button>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  )
}
