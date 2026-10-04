import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { SecuritiesPanel } from '@/features/intake'
import { requireAnyRole } from '@/lib/server/auth-session'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('intake.securities')
  return { title: t('title'), robots: { index: false, follow: false } }
}

// 只给 info 管理员（PRD/apps/info.md 第二节）。后端另有一道：普通用户调管理接口会被拒。
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await requireAnyRole(locale, ['admin'])
  const t = await getTranslations('intake.securities')
  return (
    <div>
      <div className="admin-page-heading">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('lead')}</p>
      </div>
      <SecuritiesPanel csrfToken={session.csrf_token} />
    </div>
  )
}
