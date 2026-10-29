'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

import type { Channel, RegistrationInput } from '@/contracts/supply'

import { splitList } from '../model/supply'

const KINDS = ['catalog', 'feed', 'web', 'search'] as const
const READINGS = ['original', 'text', 'pages', 'table'] as const
const LICENSES = ['self', 'via_expert', 'sale'] as const

type Props = {
  plugins: readonly { name: string; kind: string }[]
  // 改登记时给现有的那条；大类、插件、编号不能改
  initial?: Channel
  pending: boolean
  onSubmit(input: RegistrationInput, extra: { channelId: string; reason: string }): void
}

// 登记或改登记一条渠道（0045 第 3.1 节）：名称、大类、插件；能提供什么；条款与许可；规矩
export function RegistrationForm({ plugins, initial, pending, onSubmit }: Props) {
  const t = useTranslations('supply')
  const [channelId, setChannelId] = useState(initial?.channel_id ?? '')
  const [name, setName] = useState(initial?.name ?? '')
  const [kind, setKind] = useState<RegistrationInput['kind']>(
    (initial?.kind as RegistrationInput['kind']) ?? 'catalog',
  )
  const usable = plugins.filter((p) => p.kind === kind)
  const [plugin, setPlugin] = useState(initial?.plugin ?? usable[0]?.name ?? '')
  const [docTypes, setDocTypes] = useState(initial?.doc_types.join(', ') ?? '')
  const [readings, setReadings] = useState<RegistrationInput['readings']>(
    (initial?.readings as RegistrationInput['readings']) ?? ['original'],
  )
  const [license, setLicense] = useState<RegistrationInput['license']>(
    (initial?.license as RegistrationInput['license']) ?? 'self',
  )
  const [rate, setRate] = useState(String(initial?.rate_per_minute ?? 10))
  const [cap, setCap] = useState(String(initial?.daily_cap ?? 500))
  const [domain, setDomain] = useState(initial?.domain ?? '')
  const [terms, setTerms] = useState(initial?.terms_url ?? '')
  const [render, setRender] = useState(initial?.render_allowed ?? false)
  const [robots, setRobots] = useState(initial?.obey_robots ?? true)
  const [reason, setReason] = useState('')
  const editing = Boolean(initial)
  const ready =
    name.trim() &&
    plugin &&
    (editing ? reason.trim() : channelId.trim()) &&
    Number(rate) > 0 &&
    Number(cap) > 0

  function toggle(reading: RegistrationInput['readings'][number]) {
    setReadings((current) =>
      current.includes(reading) ? current.filter((r) => r !== reading) : [...current, reading],
    )
  }

  return (
    <form
      className="schema-form"
      aria-label={editing ? t('form.editTitle') : t('form.registerTitle')}
      onSubmit={(event) => {
        event.preventDefault()
        if (!ready) return
        onSubmit(
          {
            name: name.trim(),
            kind,
            plugin,
            doc_types: splitList(docTypes),
            readings,
            license,
            rate_per_minute: Number(rate),
            daily_cap: Number(cap),
            domain: domain.trim() || null,
            terms_url: terms.trim() || null,
            render_allowed: render,
            obey_robots: robots,
          },
          { channelId: channelId.trim(), reason: reason.trim() },
        )
      }}
    >
      {editing ? null : (
        <div className="schema-field">
          <label htmlFor="supply-channel-id">{t('form.channelId')}</label>
          <input
            id="supply-channel-id"
            value={channelId}
            onChange={(e) => setChannelId(e.target.value)}
            placeholder="sse-periodic"
          />
        </div>
      )}
      <div className="schema-field">
        <label htmlFor="supply-name">{t('form.name')}</label>
        <input id="supply-name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="schema-field">
        <label htmlFor="supply-kind">{t('form.kind')}</label>
        <select
          id="supply-kind"
          value={kind}
          disabled={editing}
          onChange={(e) => {
            const next = e.target.value as RegistrationInput['kind']
            setKind(next)
            setPlugin(plugins.find((p) => p.kind === next)?.name ?? '')
          }}
        >
          {KINDS.map((k) => (
            <option key={k} value={k}>
              {t(`kind.${k}`)}
            </option>
          ))}
        </select>
      </div>
      <div className="schema-field">
        <label htmlFor="supply-plugin">{t('form.plugin')}</label>
        <select
          id="supply-plugin"
          value={plugin}
          disabled={editing}
          onChange={(e) => setPlugin(e.target.value)}
        >
          {usable.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div className="schema-field">
        <label htmlFor="supply-doc-types">{t('form.docTypes')}</label>
        <input
          id="supply-doc-types"
          value={docTypes}
          onChange={(e) => setDocTypes(e.target.value)}
          placeholder="annual_report, semiannual_report"
        />
      </div>
      <fieldset className="schema-field">
        <legend>{t('form.readings')}</legend>
        {READINGS.map((r) => (
          <label key={r} className="mr-3 inline-flex items-center gap-1">
            <input type="checkbox" checked={readings.includes(r)} onChange={() => toggle(r)} />
            {t(`reading.${r}`)}
          </label>
        ))}
      </fieldset>
      <div className="schema-field">
        <label htmlFor="supply-license">{t('form.license')}</label>
        <select
          id="supply-license"
          value={license}
          onChange={(e) => setLicense(e.target.value as RegistrationInput['license'])}
        >
          {LICENSES.map((l) => (
            <option key={l} value={l}>
              {t(`license.${l}`)}
            </option>
          ))}
        </select>
      </div>
      <div className="schema-field">
        <label htmlFor="supply-rate">{t('form.rate')}</label>
        <input
          id="supply-rate"
          type="number"
          min={1}
          value={rate}
          onChange={(e) => setRate(e.target.value)}
        />
      </div>
      <div className="schema-field">
        <label htmlFor="supply-cap">{t('form.dailyCap')}</label>
        <input
          id="supply-cap"
          type="number"
          min={1}
          value={cap}
          onChange={(e) => setCap(e.target.value)}
        />
      </div>
      <div className="schema-field">
        <label htmlFor="supply-domain">{t('form.domain')}</label>
        <input
          id="supply-domain"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="www.example.gov.cn"
        />
      </div>
      <div className="schema-field">
        <label htmlFor="supply-terms">{t('form.terms')}</label>
        <input id="supply-terms" value={terms} onChange={(e) => setTerms(e.target.value)} />
      </div>
      <label className="inline-flex items-center gap-1">
        <input type="checkbox" checked={render} onChange={(e) => setRender(e.target.checked)} />
        {t('form.render')}
      </label>
      <label className="inline-flex items-center gap-1">
        <input type="checkbox" checked={robots} onChange={(e) => setRobots(e.target.checked)} />
        {t('form.robots')}
      </label>
      {editing ? (
        <div className="schema-field">
          <label htmlFor="supply-edit-reason">{t('form.reason')}</label>
          <input
            id="supply-edit-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
      ) : null}
      <div className="reference-actions">
        <button type="submit" className="primary-button" disabled={!ready || pending}>
          {editing ? t('form.save') : t('form.register')}
        </button>
      </div>
    </form>
  )
}
