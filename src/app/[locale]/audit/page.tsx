import { setRequestLocale } from 'next-intl/server'

import { HydrateClient, trpc } from '~/trpc/server'

import Audit from './client'

export default async function AuditPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  void trpc.elections.findFinished.prefetch()

  return (
    <HydrateClient>
      <Audit />
    </HydrateClient>
  )
}
