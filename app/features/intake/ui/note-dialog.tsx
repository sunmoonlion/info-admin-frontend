'use client'

import { useId, useState } from 'react'

// 要写一句话才能做的动作（拒绝申请、移出关注清单）。必填时不写不能确认。
export function NoteDialog({
  title,
  label,
  confirmLabel,
  cancelLabel,
  required,
  problem,
  onConfirm,
  onClose,
}: {
  title: string
  label: string
  confirmLabel: string
  cancelLabel: string
  required: boolean
  // 不合规矩时显示的话；合规矩就是 null
  problem(note: string): string | null
  onConfirm(note: string): Promise<void> | void
  onClose(): void
}) {
  const id = useId()
  const [note, setNote] = useState('')
  const [pending, setPending] = useState(false)
  const wrong = problem(note)
  return (
    <div className="dialog-backdrop" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby={id} className="dialog-card">
        <h2 id={id}>{title}</h2>
        <label htmlFor={`${id}-note`}>{label}</label>
        <textarea
          id={`${id}-note`}
          value={note}
          rows={3}
          onChange={(event) => setNote(event.target.value)}
          required={required}
        />
        {note !== '' && wrong ? (
          <p role="alert" className="text-destructive text-xs">
            {wrong}
          </p>
        ) : null}
        <div className="dialog-actions">
          <button type="button" onClick={onClose} disabled={pending}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className="primary-button"
            disabled={pending || wrong !== null}
            onClick={async () => {
              setPending(true)
              try {
                await onConfirm(note.trim())
              } finally {
                setPending(false)
              }
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  )
}
