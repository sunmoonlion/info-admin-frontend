import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function ForbiddenPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations('errors')
  return (
    <div className="center-page">
      <h1>{t('forbiddenTitle')}</h1>
      <p>{t('forbiddenDescription')}</p>
      <Link href={`/${locale}/dashboard`} className="primary-button">
        {t('returnDashboard')}
      </Link>
    </div>
  )
}
