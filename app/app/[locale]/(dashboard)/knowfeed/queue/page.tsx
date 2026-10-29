import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { QueuePanel } from '@/features/supply'
import { requireAnyRole } from '@/lib/server/auth-session'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('supply.queue')
  return { title: t('title'), robots: { index: false, follow: false } }
}

// 队列监控（SDD 0045 第 3.3 节）：各渠道的作业、尝试与积压。
export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const session = await requireAnyRole(locale, ['admin', 'operator'])
  const t = await getTranslations('supply.queue')
  return (
    <div>
      <div className="admin-page-heading">
        <h1 className="text-2xl font-semibold">{t('title')}</h1>
        <p className="text-muted-foreground">{t('lead')}</p>
      </div>
      <QueuePanel csrfToken={session.csrf_token} />
    </div>
  )
}
