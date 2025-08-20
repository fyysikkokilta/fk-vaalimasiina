import { Locale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import Login from './client'

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const t = await getTranslations({
    locale,
    namespace: 'metadata.login'
  })
  return {
    title: t('title'),
    description: t('description')
  }
}

export default async function LoginPage({
  params
}: PageProps<'/[locale]/login'>) {
  const { locale } = await params
  const nextIntlLocale = locale as Locale
  setRequestLocale(nextIntlLocale)

  return <Login />
}
