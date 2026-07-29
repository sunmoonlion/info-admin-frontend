'use client'

import { useId, useState } from 'react'

export function AuditedActionDialog({
  triggerLabel,
  title,
  description,
  confirmLabel,
  onConfirm,
}: {
  triggerLabel: string
  title: string
  description: string
  confirmLabel: string
  onConfirm(reason: string): void | Promise<void>
}) {
  const dialogId = useId()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [pending, setPending] = useState(false)
  return (
    <>
      <button type="button" className="secondary-button" onClick={() => setOpen(true)}>
        {triggerLabel}
      </button>
      {open ? (
        <div className="dialog-backdrop" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby={dialogId} className="dialog-card">
            <h2 id={dialogId}>{title}</h2>
            <p>{description}</p>
            <label htmlFor={`${dialogId}-reason`}>Audit reason</label>
            <textarea
              id={`${dialogId}-reason`}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              minLength={3}
              maxLength={500}
              required
            />
            <div className="dialog-actions">
              <button type="button" onClick={() => setOpen(false)} disabled={pending}>Cancel</button>
              <button
                type="button"
                className="primary-button"
                disabled={pending || reason.trim().length < 3}
                onClick={async () => {
                  setPending(true)
                  try {
                    await onConfirm(reason.trim())
                    setOpen(false)
                    setReason('')
                  } finally {
                    setPending(false)
                  }
                }}
              >
                {pending ? 'Working…' : confirmLabel}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  )
}
