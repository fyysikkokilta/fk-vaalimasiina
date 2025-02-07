import { setRequestLocale } from 'next-intl/server'

import { HydrateClient, trpc } from '~/trpc/server'

import Vote from './client'

export default async function VotePage({
  params
}: {
  params: Promise<{ locale: string; voterId: string }>
}) {
  const { locale, voterId } = await params
  setRequestLocale(locale)

  void trpc.voters.getWithId.prefetch({ voterId })

  return (
    <HydrateClient>
      <Vote voterId={voterId} />
    </HydrateClient>
  )
}
