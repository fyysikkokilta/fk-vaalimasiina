import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import { getVoter } from '~/data/getVoter'
import isUUID from '~/utils/isUUID'

import Vote from './client'

export function generateStaticParams() {
  return []
}

export async function generateMetadata({
  params
}: PageProps<'/[locale]/vote/[voterId]'>) {
  const { voterId } = await params
  const t = await getTranslations('metadata.vote')

  if (!isUUID(voterId)) {
    return null
  }

  return {
    title: t('title'),
    description: t('description')
  }
}

export default async function VotePage({
  params
}: PageProps<'/[locale]/vote/[voterId]'>) {
  const { voterId } = await params

  if (!isUUID(voterId)) {
    notFound()
  }

  const voterElection = await getVoter(voterId)

  if (!voterElection) {
    notFound()
  }

  return <Vote {...voterElection} />
}
