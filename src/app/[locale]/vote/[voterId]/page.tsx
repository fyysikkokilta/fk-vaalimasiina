import { notFound } from 'next/navigation'
import { Locale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { getVoter } from '~/data/getVoter'
import isUUID from '~/utils/isUUID'

import Vote from './client'

export function generateStaticParams() {
  return []
}

export async function generateMetadata({
  params
}: PageProps<'/[locale]/vote/[voterId]'>) {
  const { locale, voterId } = await params
  const nextIntlLocale = locale as Locale
  const t = await getTranslations({
    locale: nextIntlLocale,
    namespace: 'metadata.vote'
  })

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
  const { locale, voterId } = await params
  const nextIntlLocale = locale as Locale
  setRequestLocale(nextIntlLocale)

  if (!isUUID(voterId)) {
    notFound()
  }

  const voterElection = await getVoter(voterId)

  if (!voterElection) {
    notFound()
  }

  return <Vote {...voterElection} />
}
