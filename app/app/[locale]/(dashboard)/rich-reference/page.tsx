import type { Metadata } from 'next'
import { RichReference } from '@/components/reference/rich-reference'
import { requireAnyRole } from '@/lib/server/auth-session'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Rich capability reference',
  robots: { index: false, follow: false },
}

export default async function RichReferencePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  await requireAnyRole(locale, ['admin'])
  return (
    <div>
      <div className="admin-page-heading">
        <h1 className="text-2xl font-semibold">Rich capability boundaries</h1>
        <p className="text-muted-foreground">
          Safe, local and accessible defaults replace framework-specific directives.
        </p>
      </div>
      <RichReference />
    </div>
  )
}
