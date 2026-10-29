'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { useChannels, useRegister, useReorder } from '../api/supply'
import { codeOf, moved } from '../model/supply'
import { ChannelDetail } from './channel-detail'
import { useErrorText } from './error-text'
import { RegistrationForm } from './registration-form'

// 来源目录（0045 第 3.1 节）：渠道的登记、审核与试采、在用 / 暂停 / 停用、先后。
// 加渠道是登记一条记录，不改代码；审过才会被切合用上，按这里的先后试
export function ChannelsPanel({ csrfToken }: { csrfToken: string }) {
  const t = useTranslations('supply')
  const errorText = useErrorText()
  const channels = useChannels()
  const reorder = useReorder(csrfToken)
  const register = useRegister(csrfToken)
  const [picked, setPicked] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  if (channels.isPending) return <p className="crud-state">{t('loading')}</p>
  if (channels.isError || !channels.data)
    return (
      <p role="alert" className="crud-error">
        {t('failed')}
      </p>
    )
  const { items, plugins, auto_pause_after } = channels.data
  const ids = items.map((c) => c.channel_id)
  const failed = (error: unknown) => setMessage(errorText(codeOf(error)))

  return (
    <div className="reference-grid">
      <section className="reference-card reference-wide" aria-label={t('channels.title')}>
        <p className="reference-notice">{t('channels.howItWorks', { n: auto_pause_after })}</p>
        {message ? (
          <p role="status" className="reference-notice">
            {message}
          </p>
        ) : null}
        <div className="crud-table-wrap">
          <table className="crud-table">
            <caption className="sr-only">{t('channels.title')}</caption>
            <thead>
              <tr>
                <th>{t('col.order')}</th>
                <th>{t('col.name')}</th>
                <th>{t('col.kind')}</th>
                <th>{t('col.review')}</th>
                <th>{t('col.status')}</th>
                <th>{t('col.license')}</th>
                <th>{t('col.limits')}</th>
                <th>{t('col.failures')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c, n) => (
                <tr key={c.channel_id}>
                  <td>
                    <button
                      type="button"
                      aria-label={t('channels.up', { name: c.name })}
                      disabled={n === 0 || reorder.isPending}
                      onClick={() =>
                        reorder.mutate(moved(ids, c.channel_id, -1), { onError: failed })
                      }
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label={t('channels.down', { name: c.name })}
                      disabled={n === items.length - 1 || reorder.isPending}
                      onClick={() =>
                        reorder.mutate(moved(ids, c.channel_id, 1), { onError: failed })
                      }
                    >
                      ↓
                    </button>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="underline"
                      onClick={() => setPicked(c.channel_id)}
                    >
                      {c.name}
                    </button>
                    {c.domain ? (
                      <span className="text-muted-foreground ml-1 font-mono text-xs">
                        {c.domain}
                      </span>
                    ) : null}
                  </td>
                  <td>{t(`kind.${c.kind}`)}</td>
                  <td>{t(`review.${c.review}`)}</td>
                  <td>
                    {t(`status.${c.status}`)}
                    {c.status_reason ? (
                      <span className="text-muted-foreground ml-1 text-xs">{c.status_reason}</span>
                    ) : null}
                  </td>
                  <td>{t(`license.${c.license}`)}</td>
                  <td>{t('limits', { rate: c.rate_per_minute, cap: c.daily_cap })}</td>
                  <td>{c.consecutive_failures}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="reference-actions">
          <button type="button" onClick={() => setAdding((v) => !v)}>
            {adding ? t('channels.closeRegister') : t('channels.openRegister')}
          </button>
        </div>
        {adding ? (
          <RegistrationForm
            plugins={plugins}
            pending={register.isPending}
            onSubmit={(input, { channelId }) =>
              register.mutate(
                { ...input, channel_id: channelId },
                {
                  onSuccess: (made) => {
                    setAdding(false)
                    setPicked(made.channel_id)
                    setMessage(t('channels.registered'))
                  },
                  onError: failed,
                },
              )
            }
          />
        ) : null}
      </section>
      {picked ? <ChannelDetail channelId={picked} plugins={plugins} csrfToken={csrfToken} /> : null}
    </div>
  )
}
