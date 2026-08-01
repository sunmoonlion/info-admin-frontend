'use client'

import { useState } from 'react'
import { safeMediaPath } from '@/lib/rich-utils'

export function MediaPlayer({
  type,
  src,
  label,
}: {
  type: 'audio' | 'video'
  src: string
  label: string
}) {
  const [failed, setFailed] = useState(false)
  let safeSrc: string
  try {
    safeSrc = safeMediaPath(src)
  } catch {
    return <p role="alert">Unsafe media source rejected</p>
  }
  if (failed) return <p role="alert">Media could not be loaded</p>
  return type === 'audio' ? (
    <audio controls preload="metadata" src={safeSrc} aria-label={label} onError={() => setFailed(true)} />
  ) : (
    <video controls preload="metadata" src={safeSrc} aria-label={label} onError={() => setFailed(true)} />
  )
}
