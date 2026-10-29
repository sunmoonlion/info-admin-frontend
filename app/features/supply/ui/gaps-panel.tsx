'use client'

import { useFormatter, useTranslations } from 'next-intl'
import { useState } from 'react'

import { useGaps } from '../api/supply'

const KINDS = ['', 'uncovered', 'absent', 'site'] as const

// 缺口清单（0045 第四节）：需求项「无法满足」的汇总，平台人员据此补渠道。
// 按「哪种 × 类型」分组；只写几项、几个人、几个主体，看不出是谁要的
export function GapsPanel() {
  const t = useTranslations('supply')
  const format = useFormatter()
  const [kind, setKind] = useState<(typeof KINDS)[number]>('uncovered')
  const gaps = useGaps(kind)
  const when = (at: string) =>
    format.dateTime(new Date(at), { dateStyle: 'medium', timeStyle: 'short' })

  return (
    <section className="reference-card reference-wide" aria-label={t('gaps.title')}>
      <p className="reference-notice">{t('gaps.howItWorks')}</p>
      <div className="schema-field md:w-64">
        <label htmlFor="supply-gap-kind">{t('gaps.kind')}</label>
        <select
          id="supply-gap-kind"
          value={kind}
          onChange={(e) => setKind(e.target.value as (typeof KINDS)[number])}
        >
          {KINDS.map((k) => (
            <option key={k} value={k}>
              {t(`gapKind.${k || 'all'}`)}
            </option>
          ))}
        </select>
      </div>
      {gaps.isPending ? <p className="crud-state">{t('loading')}</p> : null}
      {gaps.isError ? (
        <p role="alert" className="crud-error">
          {t('failed')}
        </p>
      ) : null}
      {gaps.data && gaps.data.length === 0 ? (
        <p role="status" className="crud-state">
          {t('gaps.none')}
        </p>
      ) : null}
      {gaps.data && gaps.data.length > 0 ? (
        <div className="crud-table-wrap">
          <table className="crud-table">
            <caption className="sr-only">{t('gaps.title')}</caption>
            <thead>
              <tr>
                <th>{t('col.gapKind')}</th>
                <th>{t('col.docType')}</th>
                <th>{t('col.items')}</th>
                <th>{t('col.users')}</th>
                <th>{t('col.subjects')}</th>
                <th>{t('col.lastAt')}</th>
              </tr>
            </thead>
            <tbody>
              {gaps.data.map((gap) => (
                <tr key={`${gap.kind}-${gap.doc_type}`}>
                  <td>{t(`gapKind.${gap.kind}`)}</td>
                  <td className="font-mono">{gap.doc_type ?? '—'}</td>
                  <td>{gap.items}</td>
                  <td>{gap.users}</td>
                  <td>
                    {gap.subjects}
                    {gap.sample_subjects.length ? (
                      <span className="text-muted-foreground ml-1 font-mono text-xs">
                        {gap.sample_subjects.join(', ')}
                      </span>
                    ) : null}
                  </td>
                  <td>{when(gap.last_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  )
}
