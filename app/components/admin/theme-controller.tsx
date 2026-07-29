'use client'

import { useEffect } from 'react'
import { useUiStore } from '@/store/ui'

export function ThemeController() {
  const themeMode = useUiStore((state) => state.themeMode)
  const density = useUiStore((state) => state.density)

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = themeMode === 'dark' || (themeMode === 'system' && media.matches)
      document.documentElement.classList.toggle('dark', dark)
      document.documentElement.dataset.density = density
      document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
    }
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [density, themeMode])

  return null
}
