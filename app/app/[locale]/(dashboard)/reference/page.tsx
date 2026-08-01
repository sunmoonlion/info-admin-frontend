import type { Metadata } from 'next'
import { CrudReference } from '@/components/reference/crud-reference'
import { requireAnyRole } from '@/lib/server/auth-session'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'CRUD reference',
  robots: { index: false, follow: false },
}

export default async function ReferencePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  await requireAnyRole(locale, ['admin', 'operator'])
  return (
    <div>
      <div className="admin-page-heading">
        <h1 className="text-2xl font-semibold">CRUD and audit reference</h1>
        <p className="text-muted-foreground">
          Neutral adapters prove common behavior; they are not domain resources or mock success.
        </p>
      </div>
      <CrudReference />
    </div>
  )
}
