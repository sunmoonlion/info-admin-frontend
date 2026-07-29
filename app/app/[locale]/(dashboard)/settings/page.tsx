'use client'

import { useTranslations } from 'next-intl'
import { useUiStore } from '@/store/ui'

export default function SettingsPage() {
  const t = useTranslations('settings')
  const setOpen = useUiStore((state) => state.setSettingsOpen)
  return (
    <div>
      <div className="admin-page-heading">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <p className="text-muted-foreground">
          Theme, density and navigation preferences are UI-only state.
        </p>
      </div>
      <button type="button" className="primary-button mt-6" onClick={() => setOpen(true)}>
        {t('title')}
      </button>
    </div>
  )
}
