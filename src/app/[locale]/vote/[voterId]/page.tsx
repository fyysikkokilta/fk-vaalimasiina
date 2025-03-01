import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'

import { getQueryClient, trpc } from '~/trpc/server'
import isUUID from '~/utils/isUUID'

import Vote from './client'

export default async function VotePage({
  params
}: {
  params: Promise<{ locale: string; voterId: string }>
}) {
  const { locale, voterId } = await params
  setRequestLocale(locale)

  if (!isUUID(voterId)) {
    notFound()
  }

  const queryClient = getQueryClient()
  void queryClient.prefetchQuery(
    trpc.voters.getWithId.queryOptions({ voterId })
  )

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Vote voterId={voterId} />
    </HydrationBoundary>
  )
}
