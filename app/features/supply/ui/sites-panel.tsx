'use client'

import { useFormatter, useNow, useTranslations } from 'next-intl'
import { useState } from 'react'

import { useChannels, useSites } from '../api/supply'
import { hoursSince } from '../model/supply'
import { ChannelDetail } from './channel-detail'

// 待审网站（0045 第 3.1 节）：通用网页按网站审。用户给的网址落在没登记的网站上自动建一条，
// 需求等审核；超过时限没人审，在等的需求项转「无法满足」。待审太多、等太久在这里告警
export function SitesPanel({ csrfToken }: { csrfToken: string }) {
  const t = useTranslations('supply')
  const format = useFormatter()
  const now = useNow()
  const sites = useSites()
  const plugins = useChannels().data?.plugins ?? []
  const [picked, setPicked] = useState<string | null>(null)

  if (sites.isPending) return <p className="crud-state">{t('loading')}</p>
  if (sites.isError || !sites.data)
    return (
      <p role="alert" className="crud-error">
        {t('failed')}
      </p>
    )
  const data = sites.data
  return (
    <div className="reference-grid">
      <section className="reference-card reference-wide" aria-label={t('sites.title')}>
        <p className="reference-notice">
          {t('sites.howItWorks', { days: data.review_within_days })}
        </p>
        {data.alerts.map((alert) => (
          <p key={alert} role="alert" className="crud-error">
            {t(`sites.alert.${alert}`, {
              count: data.alert_count,
              hours: data.alert_wait_hours,
            })}
          </p>
        ))}
        {data.items.length === 0 ? (
          <p role="status" className="crud-state">
            {t('sites.none')}
          </p>
        ) : (
          <div className="crud-table-wrap">
            <table className="crud-table">
              <caption className="sr-only">{t('sites.title')}</caption>
              <thead>
                <tr>
                  <th>{t('col.site')}</th>
                  <th>{t('col.since')}</th>
                  <th>{t('col.waited')}</th>
                  <th>{t('col.waitingItems')}</th>
                  <th>{t('col.users')}</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((site) => (
                  <tr key={site.channel_id}>
                    <td>
                      <button
                        type="button"
                        className="font-mono underline"
                        onClick={() => setPicked(site.channel_id)}
                      >
                        {site.domain ?? site.channel_id}
                      </button>
                    </td>
                    <td>
                      {site.since
                        ? format.dateTime(new Date(site.since), {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : '—'}
                    </td>
                    <td>{t('hours', { n: hoursSince(site.since, now) ?? 0 })}</td>
                    <td>{site.waiting_items}</td>
                    <td>{site.users}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {picked ? <ChannelDetail channelId={picked} plugins={plugins} csrfToken={csrfToken} /> : null}
    </div>
  )
}
