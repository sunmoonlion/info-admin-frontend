'use client'

import { useFormatter, useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

import { IntakeError } from '../api/http'
import { useDatasets, useIngestion, useIngestions, useSecurityActions } from '../api/intake'
import { bytes, canRegister, isCode, registrationOf } from '../model/intake'

type Notice = { tone: 'ok' | 'error'; text: string }

// 证券采集：输入代码，直接发起；看这家公司的批次（可点开看每一项）和数据集（可重新登记）。
export function SecuritiesPanel({ csrfToken }: { csrfToken: string }) {
  const t = useTranslations('intake.securities')
  const tc = useTranslations('intake.common')
  const format = useFormatter()
  const given = useSearchParams().get('code') ?? ''
  const [typed, setTyped] = useState<string | null>(null)
  const [looking, setLooking] = useState<string | null>(null)
  const [opened, setOpened] = useState<string | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)
  const text = typed ?? (isCode(given) ? given : '')
  const code = looking ?? (isCode(given) ? given : '')
  const batches = useIngestions(code)
  const datasets = useDatasets(code)
  const detail = useIngestion(opened)
  const act = useSecurityActions(csrfToken)
  const when = (at: string | null) =>
    at ? format.dateTime(new Date(at), { dateStyle: 'medium', timeStyle: 'short' }) : '—'
  const failed = (error: unknown) => {
    const found = error instanceof IntakeError ? error.code : 'other'
    setNotice({
      tone: 'error',
      text: t.has(`problem.${found}`) ? t(`problem.${found}`) : t('problem.other'),
    })
  }

  return (
    <div className="space-y-6">
      <section className="reference-card">
        <div className="reference-actions items-end">
          <div className="schema-field md:w-48">
            <label htmlFor="intake-code">{tc('code')}</label>
            <input
              id="intake-code"
              inputMode="numeric"
              maxLength={6}
              value={text}
              onChange={(event) => setTyped(event.target.value)}
            />
          </div>
          <button
            type="button"
            className="secondary-button"
            disabled={!isCode(text)}
            onClick={() => setLooking(text.trim())}
          >
            {t('look')}
          </button>
          <button
            type="button"
            className="primary-button"
            disabled={!isCode(text) || act.start.isPending}
            onClick={async () => {
              setNotice(null)
              const target = text.trim()
              try {
                await act.start.mutateAsync(target)
                setLooking(target)
                setNotice({ tone: 'ok', text: t('started', { code: target }) })
              } catch (error) {
                failed(error)
              }
            }}
          >
            {act.start.isPending ? t('starting') : t('start')}
          </button>
        </div>
        {text !== '' && !isCode(text) && text.length >= 6 ? (
          <p role="alert" className="crud-error">
            {t('codeInvalid')}
          </p>
        ) : null}
        {notice ? (
          <p
            role={notice.tone === 'error' ? 'alert' : 'status'}
            className={notice.tone === 'error' ? 'crud-error' : 'reference-notice'}
          >
            {notice.text}
          </p>
        ) : null}
      </section>

      {code ? (
        <>
          <section className="reference-card" aria-label={t('batches')}>
            <h2>
              {t('batches')} · <span className="font-mono">{code}</span>
            </h2>
            {batches.isPending ? <p className="crud-state">{tc('loading')}</p> : null}
            {batches.isError ? <p className="crud-error">{tc('failed')}</p> : null}
            <div className="crud-table-wrap">
              <table className="crud-table">
                <caption className="sr-only">{t('batches')}</caption>
                <thead>
                  <tr>
                    <th>{t('requested')}</th>
                    <th>{t('status')}</th>
                    <th>{t('sources')}</th>
                    <th>{t('error')}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {(batches.data ?? []).map((batch) => (
                    <tr key={batch.id}>
                      <td>{when(batch.requested_at)}</td>
                      <td>
                        {t.has(`batchStatus.${batch.status}`)
                          ? t(`batchStatus.${batch.status}`)
                          : batch.status}
                      </td>
                      <td>{batch.sources.join('、')}</td>
                      <td>{batch.error_code ?? '—'}</td>
                      <td>
                        <button
                          type="button"
                          className="secondary-button"
                          aria-expanded={opened === batch.id}
                          onClick={() => setOpened(opened === batch.id ? null : batch.id)}
                        >
                          {opened === batch.id ? t('hideDetail') : t('detail')}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {batches.data?.length === 0 ? (
                    <tr>
                      <td colSpan={5}>{t('noBatches')}</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
            {opened && detail.data ? (
              <div className="mt-3">
                <p className="text-sm font-medium">{t('items', { n: detail.data.items.length })}</p>
                {detail.data.items.length === 0 ? (
                  <p className="crud-state">{t('noItems')}</p>
                ) : (
                  <div className="crud-table-wrap">
                    <table className="crud-table">
                      <thead>
                        <tr>
                          <th>{t('item.source')}</th>
                          <th>{t('item.kind')}</th>
                          <th>{t('item.size')}</th>
                          <th>{t('item.reused')}</th>
                          <th>{t('item.http')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.data.items.map((item) => (
                          <tr key={item.seq}>
                            <td>{item.source_code}</td>
                            <td>{item.kind}</td>
                            <td>{bytes(item.size_bytes)}</td>
                            <td>{item.reused ? t('item.yes') : t('item.no')}</td>
                            <td>{item.http_status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : null}
          </section>

          <section className="reference-card" aria-label={t('datasets')}>
            <h2>{t('datasets')}</h2>
            {datasets.isPending ? <p className="crud-state">{tc('loading')}</p> : null}
            {datasets.isError ? <p className="crud-error">{tc('failed')}</p> : null}
            <div className="crud-table-wrap">
              <table className="crud-table">
                <caption className="sr-only">{t('datasets')}</caption>
                <thead>
                  <tr>
                    <th>{t('version')}</th>
                    <th>{t('status')}</th>
                    <th>{t('range')}</th>
                    <th>{t('failedChecks')}</th>
                    <th>{t('built')}</th>
                    <th>{t('registration')}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {(datasets.data ?? []).map((dataset) => {
                    const state = registrationOf(dataset)
                    return (
                      <tr key={dataset.id}>
                        <td className="font-mono text-xs">{dataset.data_version}</td>
                        <td>
                          {t.has(`datasetStatus.${dataset.status}`)
                            ? t(`datasetStatus.${dataset.status}`)
                            : dataset.status}
                        </td>
                        <td>
                          {dataset.start_date} → {dataset.end_date}
                        </td>
                        <td>
                          {dataset.failed_checks.length
                            ? dataset.failed_checks.join('、')
                            : tc('none')}
                        </td>
                        <td>{when(dataset.built_at)}</td>
                        <td>
                          {t(`reg.${state}`, { error: dataset.knowledge_registration_error ?? '' })}
                        </td>
                        <td>
                          {canRegister(dataset) ? (
                            <button
                              type="button"
                              className="secondary-button"
                              disabled={act.register.isPending}
                              onClick={async () => {
                                setNotice(null)
                                try {
                                  await act.register.mutateAsync(dataset.id)
                                  setNotice({ tone: 'ok', text: t('registered') })
                                } catch (error) {
                                  failed(error)
                                }
                              }}
                            >
                              {act.register.isPending ? t('registering') : t('register')}
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    )
                  })}
                  {datasets.data?.length === 0 ? (
                    <tr>
                      <td colSpan={7}>{t('noDatasets')}</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </div>
  )
}
