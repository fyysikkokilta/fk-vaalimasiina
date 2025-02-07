import { hasCookie } from 'cookies-next/server'
import { cookies } from 'next/headers'
import { setRequestLocale } from 'next-intl/server'

import { redirect } from '~/i18n/routing'
import { HydrateClient, trpc } from '~/trpc/server'

import Admin from './client'

export default async function AuditPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  void trpc.admin.elections.findCurrent.prefetch()

  const value = await hasCookie('admin-token', { cookies })
  if (!value) {
    redirect({
      href: '/login',
      locale
    })
  }

  return (
    <HydrateClient>
      <Admin />
    </HydrateClient>
  )
}
