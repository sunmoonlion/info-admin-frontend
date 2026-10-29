import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { GapsPanel } from '@/features/supply'
import { requireAnyRole } from '@/lib/server/auth-session'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('supply.gaps')
  return { title: t('title'), robots: { index: false, follow: false } }
}

// 缺口清单（SDD 0045 第四节）：「无法满足」的需求按类型汇总，平台人员据此补渠道。
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  await requireAnyRole(locale, ['admin', 'operator'])
  const t = await getTranslations('supply.gaps')
  return (
    <div>
      <div className="admin-page-heading">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('lead')}</p>
      </div>
      <GapsPanel />
    </div>
  )
}
