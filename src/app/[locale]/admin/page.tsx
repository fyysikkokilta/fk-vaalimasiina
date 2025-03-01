import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { getCookie } from 'cookies-next'
import { cookies } from 'next/headers'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import TitleWrapper from '~/components/TitleWrapper'
import { redirect } from '~/i18n/routing'
import { getQueryClient, trpc } from '~/trpc/server'
import isAuthorized from '~/utils/isAuthorized'

import Admin from './client'

export default async function AdminPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('admin')

  const value = await getCookie('admin-token', { cookies })
  const authorized = isAuthorized(value)
  if (!authorized) {
    redirect({
      href: '/login',
      locale
    })
  }

  const queryClient = getQueryClient()
  void queryClient.prefetchQuery(
    trpc.admin.elections.findCurrent.queryOptions()
  )

  return (
    <TitleWrapper title={t('title')}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Admin />
      </HydrationBoundary>
    </TitleWrapper>
  )
}
