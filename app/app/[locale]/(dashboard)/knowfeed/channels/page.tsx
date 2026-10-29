import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { ChannelsPanel } from '@/features/supply'
import { requireAnyRole } from '@/lib/server/auth-session'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('supply.channels')
  return { title: t('title'), robots: { index: false, follow: false } }
}

// 来源目录（SDD 0045 第 3.1 节）：渠道的登记、审核与试采、在用 / 暂停 / 停用、先后。
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await requireAnyRole(locale, ['admin', 'operator'])
  const t = await getTranslations('supply.channels')
  return (
    <div>
      <div className="admin-page-heading">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('lead')}</p>
      </div>
      <ChannelsPanel csrfToken={session.csrf_token} />
    </div>
  )
}
