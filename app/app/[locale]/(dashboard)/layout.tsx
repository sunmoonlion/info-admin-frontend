import { AppShell } from '@/components/admin/app-shell'
import { requireBrowserSession } from '@/lib/server/auth-session'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const session = await requireBrowserSession(locale)
  const userLabel =
    session.user.display_name ?? session.user.email ?? session.user.actor_id

  return (
    <AppShell locale={locale} roles={session.user.roles} userLabel={userLabel}>
      {children}
    </AppShell>
  )
}
