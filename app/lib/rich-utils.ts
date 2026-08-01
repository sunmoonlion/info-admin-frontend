'use client'

import { useCallback, useEffect, useRef } from 'react'

export function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes < 0) return '—'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let value = bytes
  let index = 0
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024
    index += 1
  }
  return `${value < 10 && index ? value.toFixed(1) : Math.round(value)} ${units[index]}`
}

export function safeMediaPath(path: string) {
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) {
    throw new Error('media path must be same-origin')
  }
  return path
}

export function useDebouncedCallback<T extends unknown[]>(
  callback: (...args: T) => void,
  delay: number,
) {
  const callbackRef = useRef(callback)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])
  return useCallback((...args: T) => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => callbackRef.current(...args), delay)
  }, [delay])
}

export function useThrottledCallback<T extends unknown[]>(
  callback: (...args: T) => void,
  interval: number,
) {
  const lastRun = useRef(0)
  return useCallback((...args: T) => {
    const now = Date.now()
    if (now - lastRun.current < interval) return
    lastRun.current = now
    callback(...args)
  }, [callback, interval])
}

export async function copyText(text: string) {
  await navigator.clipboard.writeText(text)
}
