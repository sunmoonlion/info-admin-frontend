import type { Metadata } from 'next'

import { InfoCrawlPanel } from '@/components/info/info-crawl-panel'
import { requireAnyRole } from '@/lib/server/auth-session'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Info crawl',
  robots: { index: false, follow: false },
}

export default async function InfoCrawlPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  await requireAnyRole(locale, ['admin', 'operator'])
  return (
    <div>
      <div className="admin-page-heading">
        <h1 className="text-2xl font-semibold">Info crawl</h1>
        <p className="text-muted-foreground">
          Domain control surface for Info sources, documents and crawl jobs. Common Admin shell comes
          from the frozen Next Admin template.
        </p>
      </div>
      <InfoCrawlPanel />
    </div>
  )
}
