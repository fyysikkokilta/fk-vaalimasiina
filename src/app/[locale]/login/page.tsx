import { cookies } from 'next/headers'
import { setRequestLocale } from 'next-intl/server'

import { redirect } from '~/i18n/navigation'
import isAuthorized from '~/utils/isAuthorized'

import Login from './client'

export default async function LoginPage({
  params
}: {
  params: Promise<{ locale: string }>
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
