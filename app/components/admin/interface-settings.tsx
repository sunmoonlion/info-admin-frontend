'use client'

import { X } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { useUiStore, type Density, type ThemeMode } from '@/store/ui'

const themeModes: ThemeMode[] = ['light', 'dark', 'system']
const densities: Density[] = ['comfortable', 'compact']

export function InterfaceSettings() {
  const t = useTranslations('settings')
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const open = useUiStore((state) => state.settingsOpen)
  const setOpen = useUiStore((state) => state.setSettingsOpen)
  const themeMode = useUiStore((state) => state.themeMode)
  const setThemeMode = useUiStore((state) => state.setThemeMode)
  const density = useUiStore((state) => state.density)
  const setDensity = useUiStore((state) => state.setDensity)

  if (!open) return null

  return (
    <div className="admin-settings-backdrop" role="presentation" onMouseDown={() => setOpen(false)}>
      <aside
        className="admin-settings-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="interface-settings-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <h2 id="interface-settings-title">{t('title')}</h2>
          <button type="button" className="icon-button" onClick={() => setOpen(false)}>
            <X aria-hidden />
            <span className="sr-only">{t('close')}</span>
          </button>
        </header>
        <fieldset>
          <legend>{t('theme')}</legend>
          <div className="segmented-control">
            {themeModes.map((mode) => (
              <button
                key={mode}
                type="button"
                aria-pressed={themeMode === mode}
                onClick={() => setThemeMode(mode)}
              >
                {t(`theme_${mode}`)}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>{t('density')}</legend>
          <div className="segmented-control">
            {densities.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={density === value}
                onClick={() => setDensity(value)}
              >
                {t(`density_${value}`)}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>{t('language')}</legend>
          <div className="segmented-control segmented-control-two">
            {(['zh-CN', 'en'] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={locale === value}
                onClick={() => router.replace(pathname, { locale: value })}
              >
                {value === 'zh-CN' ? '中文' : 'English'}
              </button>
            ))}
          </div>
        </fieldset>
        <button
          type="button"
          className="secondary-button w-full"
          onClick={() => {
            if (document.fullscreenElement) void document.exitFullscreen()
            else void document.documentElement.requestFullscreen()
          }}
        >
          {t('fullscreen')}
        </button>
      </aside>
    </div>
  )
}
