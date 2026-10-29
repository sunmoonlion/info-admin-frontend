import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { SitesPanel } from '@/features/supply'
import { requireAnyRole } from '@/lib/server/auth-session'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('supply.sites')
  return { title: t('title'), robots: { index: false, follow: false } }
}

// 待审网站（SDD 0045 第 3.1 节）：通用网页按网站审，没人审的超过时限转「无法满足」。
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await requireAnyRole(locale, ['admin', 'operator'])
  const t = await getTranslations('supply.sites')
  return (
    <div>
      <div className="admin-page-heading">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('lead')}</p>
      </div>
      <SitesPanel csrfToken={session.csrf_token} />
    </div>
  )
}
