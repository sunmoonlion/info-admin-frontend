'use client'

import { useRef, useState } from 'react'
import { copyText } from '@/lib/rich-utils'

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      className="secondary-button"
      onClick={async () => {
        await copyText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 1200)
      }}
    >
      {copied ? 'Copied' : label}
    </button>
  )
}

export function LongPressButton({
  label,
  onLongPress,
}: {
  label: string
  onLongPress(): void
}) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const cancel = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
  }
  return (
    <button
      type="button"
      className="secondary-button"
      onPointerDown={() => {
        cancel()
        timer.current = setTimeout(onLongPress, 600)
      }}
      onPointerUp={cancel}
      onPointerCancel={cancel}
      onPointerLeave={cancel}
    >
      {label}
    </button>
  )
}
