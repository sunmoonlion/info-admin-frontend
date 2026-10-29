'use client'

import { useFormatter, useTranslations } from 'next-intl'
import { useState } from 'react'

import type { Channel, Trial } from '@/contracts/supply'

import { useChannel, useReview, useStatus, useTrial, useUpdate } from '../api/supply'
import { codeOf, latestTrialOk, statusActions, trialRunning } from '../model/supply'
import { RegistrationForm } from './registration-form'
import { useErrorText } from './error-text'

type Props = {
  channelId: string
  plugins: readonly { name: string; kind: string }[]
  csrfToken: string
}

// 一条渠道：启停、试采、审核、改登记、审核记录（0045 第 3.1 节）
export function ChannelDetail({ channelId, plugins, csrfToken }: Props) {
  const t = useTranslations('supply')
  const format = useFormatter()
  const errorText = useErrorText()
  const detail = useChannel(channelId)
  const status = useStatus(csrfToken)
  const review = useReview(csrfToken)
  const trial = useTrial(csrfToken)
  const update = useUpdate(csrfToken)
  const [message, setMessage] = useState<string | null>(null)
  const [statusReason, setStatusReason] = useState('')
  const [editing, setEditing] = useState(false)
  const when = (at: string | null) =>
    at ? format.dateTime(new Date(at), { dateStyle: 'medium', timeStyle: 'short' }) : '—'

  if (detail.isPending) return <p className="crud-state">{t('loading')}</p>
  if (detail.isError || !detail.data)
    return (
      <p role="alert" className="crud-error">
        {t('failed')}
      </p>
    )
  const { channel, events, trials } = detail.data

  const done = (text: string) => setMessage(text)
  const failed = (error: unknown) => setMessage(errorText(codeOf(error)))

  return (
    <section className="reference-card reference-wide" aria-label={channel.name}>
      <h2>{channel.name}</h2>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm md:grid-cols-4">
        <dt>{t('col.review')}</dt>
        <dd>{t(`review.${channel.review}`)}</dd>
        <dt>{t('col.status')}</dt>
        <dd>
          {t(`status.${channel.status}`)}
          {channel.status_reason ? `（${channel.status_reason}）` : ''}
        </dd>
        <dt>{t('col.kind')}</dt>
        <dd>{t(`kind.${channel.kind}`)}</dd>
        <dt>{t('form.plugin')}</dt>
        <dd className="font-mono">{channel.plugin}</dd>
        <dt>{t('form.domain')}</dt>
        <dd className="font-mono">{channel.domain ?? '—'}</dd>
        <dt>{t('form.terms')}</dt>
        <dd className="break-all">{channel.terms_url ?? '—'}</dd>
        <dt>{t('col.docTypes')}</dt>
        <dd className="font-mono text-xs">{channel.doc_types.join(', ') || '—'}</dd>
        <dt>{t('col.limits')}</dt>
        <dd>{t('limits', { rate: channel.rate_per_minute, cap: channel.daily_cap })}</dd>
      </dl>
      {message ? (
        <p role="status" className="reference-notice">
          {message}
        </p>
      ) : null}

      <h3>{t('detail.statusTitle')}</h3>
      <div className="reference-actions">
        <input
          aria-label={t('detail.statusReason')}
          placeholder={t('detail.statusReason')}
          value={statusReason}
          onChange={(e) => setStatusReason(e.target.value)}
        />
        {statusActions(channel).map((action) => (
          <button
            key={action}
            type="button"
            disabled={status.isPending}
            onClick={() =>
              status.mutate(
                { id: channel.channel_id, action, reason: statusReason.trim() || undefined },
                { onSuccess: () => done(t(`detail.done.${action}`)), onError: failed },
              )
            }
          >
            {t(`action.${action}`)}
          </button>
        ))}
      </div>

      <TrialBox
        channel={channel}
        trials={trials}
        pending={trial.isPending}
        onRun={(input) =>
          trial.mutate(
            { id: channel.channel_id, ...input },
            { onSuccess: () => done(t('detail.done.trial')), onError: failed },
          )
        }
      />

      <ReviewBox
        channel={channel}
        canApprove={latestTrialOk(trials)}
        pending={review.isPending}
        onReview={(input) =>
          review.mutate(
            { id: channel.channel_id, ...input },
            { onSuccess: () => done(t(`detail.done.${input.decision}`)), onError: failed },
          )
        }
      />

      <h3>{t('detail.editTitle')}</h3>
      {editing ? (
        <RegistrationForm
          plugins={plugins}
          initial={channel}
          pending={update.isPending}
          onSubmit={(input, { reason }) =>
            update.mutate(
              { id: channel.channel_id, ...input, reason },
              {
                onSuccess: () => {
                  setEditing(false)
                  done(t('detail.done.update'))
                },
                onError: failed,
              },
            )
          }
        />
      ) : (
        <button type="button" onClick={() => setEditing(true)}>
          {t('detail.edit')}
        </button>
      )}

      <h3>{t('detail.eventsTitle')}</h3>
      {events.length === 0 ? (
        <p className="crud-state">{t('detail.noEvents')}</p>
      ) : (
        <div className="crud-table-wrap">
          <table className="crud-table">
            <caption className="sr-only">{t('detail.eventsTitle')}</caption>
            <thead>
              <tr>
                <th>{t('col.at')}</th>
                <th>{t('col.action')}</th>
                <th>{t('col.actor')}</th>
                <th>{t('col.reason')}</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e, n) => (
                <tr key={`${e.at}-${n}`}>
                  <td>{when(e.at)}</td>
                  <td>{t.has(`event.${e.action}`) ? t(`event.${e.action}`) : e.action}</td>
                  <td className="font-mono text-xs">{e.actor}</td>
                  <td>{e.reason ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function TrialBox({
  channel,
  trials,
  pending,
  onRun,
}: {
  channel: Channel
  trials: readonly Trial[]
  pending: boolean
  onRun(input: {
    subject: string
    doc_type: string
    period_start?: string
    period_end?: string
  }): void
}) {
  const t = useTranslations('supply')
  const [subject, setSubject] = useState('')
  const [docType, setDocType] = useState(channel.doc_types[0] ?? '')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const running = trialRunning(trials)
  return (
    <>
      <h3>{t('detail.trialTitle')}</h3>
      <p className="text-muted-foreground text-sm">{t('detail.trialLead')}</p>
      <div className="reference-actions">
        <input
          aria-label={t('trial.subject')}
          placeholder="600519.SH"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <input
          aria-label={t('trial.docType')}
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
        />
        <input
          aria-label={t('trial.periodStart')}
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
        <input
          aria-label={t('trial.periodEnd')}
          type="date"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
        />
        <button
          type="button"
          disabled={pending || running || !subject.trim() || !docType.trim()}
          onClick={() =>
            onRun({
              subject: subject.trim(),
              doc_type: docType.trim(),
              period_start: start || undefined,
              period_end: end || undefined,
            })
          }
        >
          {t('trial.run')}
        </button>
      </div>
      {trials.length === 0 ? (
        <p className="crud-state">{t('trial.none')}</p>
      ) : (
        <ul className="text-sm">
          {trials.map((trial) => (
            <li key={trial.trial_id}>
              <strong>{t(`trial.status.${trial.status}`)}</strong>{' '}
              <span className="font-mono text-xs">{JSON.stringify(trial.key)}</span>
              {trial.error ? <span>（{trial.error}）</span> : null}
              {trial.listed.length ? (
                <ul className="ml-4 list-disc">
                  {trial.listed.map((entry, n) => (
                    <li key={n}>{String(entry.title ?? entry.channel_doc_id ?? '')}</li>
                  ))}
                </ul>
              ) : null}
              {trial.fetched ? (
                <p className="text-muted-foreground ml-4">
                  {t('trial.fetched', {
                    type: String(trial.fetched.media_type ?? ''),
                    size: Number(trial.fetched.size_bytes ?? 0),
                  })}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

function ReviewBox({
  channel,
  canApprove,
  pending,
  onReview,
}: {
  channel: Channel
  canApprove: boolean
  pending: boolean
  onReview(input: {
    decision: 'approve' | 'reject'
    reason: string
    license?: 'self' | 'via_expert' | 'sale'
  }): void
}) {
  const t = useTranslations('supply')
  const [reason, setReason] = useState('')
  const [license, setLicense] = useState(channel.license as 'self' | 'via_expert' | 'sale')
  return (
    <>
      <h3>{t('detail.reviewTitle')}</h3>
      <p className="text-muted-foreground text-sm">{t('detail.reviewLead')}</p>
      <div className="reference-actions">
        <select
          aria-label={t('form.license')}
          value={license}
          onChange={(e) => setLicense(e.target.value as 'self' | 'via_expert' | 'sale')}
        >
          {(['self', 'via_expert', 'sale'] as const).map((l) => (
            <option key={l} value={l}>
              {t(`license.${l}`)}
            </option>
          ))}
        </select>
        <input
          aria-label={t('detail.reviewReason')}
          placeholder={t('detail.reviewReason')}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <button
          type="button"
          className="primary-button"
          disabled={pending || !canApprove || !reason.trim()}
          onClick={() => onReview({ decision: 'approve', reason: reason.trim(), license })}
        >
          {t('action.approve')}
        </button>
        <button
          type="button"
          disabled={pending || !reason.trim()}
          onClick={() => onReview({ decision: 'reject', reason: reason.trim() })}
        >
          {t('action.reject')}
        </button>
      </div>
      {canApprove ? null : <p className="text-muted-foreground text-sm">{t('detail.needTrial')}</p>}
    </>
  )
}
