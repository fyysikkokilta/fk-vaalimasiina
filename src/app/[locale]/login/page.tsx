import { cookies } from 'next/headers'
import { Locale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { redirect } from '~/i18n/navigation'
import isAuthorized from '~/utils/isAuthorized'

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
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const cookieStore = await cookies()
  const value = cookieStore.get('admin-token')?.value
  const authorized = isAuthorized(value)
  if (authorized) {
    redirect({
      href: '/admin',
      locale
    })
  }

  return <Login />
}
