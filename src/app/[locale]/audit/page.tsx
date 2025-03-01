import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { setRequestLocale } from 'next-intl/server'

import { getQueryClient, trpc } from '~/trpc/server'

import Audit from './client'

export default async function AuditPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const queryClient = getQueryClient()
  void queryClient.prefetchQuery(trpc.elections.findFinished.queryOptions())

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Audit />
    </HydrationBoundary>
  )
}
