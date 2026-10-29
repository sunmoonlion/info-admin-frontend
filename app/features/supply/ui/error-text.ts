'use client'

import { useTranslations } from 'next-intl'

// 后端拒绝时的错误码换成人话；没有专门说法的用一句通用的
export function useErrorText() {
  const t = useTranslations('supply.errors')
  return (code: string | null) => (code && t.has(code) ? t(code) : t('generic'))
}
