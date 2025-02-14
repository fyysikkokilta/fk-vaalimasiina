import { getCookie } from 'cookies-next/server'
import { cookies } from 'next/headers'
import { setRequestLocale } from 'next-intl/server'

import { redirect } from '~/i18n/routing'
import isAuthorized from '~/utils/isAuthorized'

import Login from './client'

export default async function LoginPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const value = await getCookie('admin-token', { cookies })
  const authorized = isAuthorized(value)
  if (authorized) {
    redirect({
      href: '/admin',
      locale
    })
  }

  return <Login />
}
