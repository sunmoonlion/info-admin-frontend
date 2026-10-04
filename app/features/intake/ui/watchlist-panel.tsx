'use client'

import { useFormatter, useTranslations } from 'next-intl'
import { useState } from 'react'

import type { WatchEntry } from '@/contracts/security-intake'

import { IntakeError } from '../api/http'
import { useWatchActions, useWatchlist } from '../api/intake'
import { isCode } from '../model/intake'
import { NoteDialog } from './note-dialog'

type Notice = { tone: 'ok' | 'error'; text: string }

// 关注清单：哪些公司在里面、谁加的、什么时候；加入、移出。增减都留痕，移出不删行。
export function WatchlistPanel({ csrfToken }: { csrfToken: string }) {
  const t = useTranslations('intake.watchlist')
  const tc = useTranslations('intake.common')
  const format = useFormatter()
  const [removedToo, setRemovedToo] = useState(false)
  const [code, setCode] = useState('')
  const [note, setNote] = useState('')
  const [removing, setRemoving] = useState<WatchEntry | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)
  const list = useWatchlist(removedToo)
  const act = useWatchActions(csrfToken)
  const when = (at: string) =>
    format.dateTime(new Date(at), { dateStyle: 'medium', timeStyle: 'short' })
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
          <div className="schema-field md:w-40">
            <label htmlFor="watch-code">{tc('code')}</label>
            <input
              id="watch-code"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value)}
            />
          </div>
          <div className="schema-field flex-1">
            <label htmlFor="watch-note">{t('addNote')}</label>
            <input
              id="watch-note"
              value={note}
              maxLength={2000}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
          <button
            type="button"
            className="primary-button"
            disabled={!isCode(code) || act.add.isPending}
            onClick={async () => {
              setNotice(null)
              const target = code.trim()
              try {
                await act.add.mutateAsync({ code: target, note })
                setNotice({ tone: 'ok', text: t('added', { code: target }) })
                setCode('')
                setNote('')
              } catch (error) {
                failed(error)
              }
            }}
          >
            {act.add.isPending ? t('adding') : t('add')}
          </button>
        </div>
        {code.length >= 6 && !isCode(code) ? (
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

      <section className="reference-card" aria-label={t('title')}>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={removedToo}
            onChange={(event) => setRemovedToo(event.target.checked)}
          />
          {t('showRemoved')}
        </label>
        {list.isPending ? <p className="crud-state">{tc('loading')}</p> : null}
        {list.isError ? <p className="crud-error">{tc('failed')}</p> : null}
        <div className="crud-table-wrap">
          <table className="crud-table">
            <caption className="sr-only">{t('title')}</caption>
            <thead>
              <tr>
                <th>{tc('code')}</th>
                <th>{t('addedAt')}</th>
                <th>{t('addedBy')}</th>
                <th>{tc('note')}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {(list.data ?? []).map((entry) => (
                <tr key={`${entry.security_code}:${entry.added_at}`}>
                  <td className="font-mono">{entry.security_code}</td>
                  <td>{when(entry.added_at)}</td>
                  <td>{entry.added_by.startsWith('system:seed') ? t('seed') : entry.added_by}</td>
                  <td>
                    {entry.note ?? '—'}
                    {entry.removed_at ? (
                      <span className="text-muted-foreground block text-xs">
                        {t('removedAt', { at: when(entry.removed_at) })}
                        {entry.removal_note ? `：${entry.removal_note}` : ''}
                      </span>
                    ) : null}
                  </td>
                  <td>
                    {entry.removed_at ? null : (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => setRemoving(entry)}
                      >
                        {t('remove')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {list.data?.length === 0 ? (
                <tr>
                  <td colSpan={5}>{t('none')}</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {removing ? (
        <NoteDialog
          title={t('removeTitle', { code: removing.security_code })}
          label={t('removeLabel')}
          confirmLabel={t('removeConfirm')}
          cancelLabel={tc('cancel')}
          required={false}
          problem={() => null}
          onClose={() => setRemoving(null)}
          onConfirm={async (reason) => {
            setNotice(null)
            try {
              await act.remove.mutateAsync({ code: removing.security_code, note: reason })
              setNotice({ tone: 'ok', text: t('removed', { code: removing.security_code }) })
            } catch (error) {
              failed(error)
            }
            setRemoving(null)
          }}
        />
      ) : null}
    </div>
  )
}
