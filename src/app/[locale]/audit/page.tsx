import { Locale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { findFinishedElection } from '~/data/findFinishedElection'

import Audit from './client'

export async function generateMetadata({
  params
}: PageProps<'/[locale]/audit'>) {
  const { locale } = await params
  const nextIntlLocale = locale as Locale
  const t = await getTranslations({
    locale: nextIntlLocale,
    namespace: 'metadata.audit'
  })
  const electionAndBallots = await findFinishedElection()
  if (!electionAndBallots.election) {
    return {
      title: t('title'),
      description: t('description_no_election')
    }
  }
  const {
    election: { title }
  } = electionAndBallots
  return {
    title: t('title'),
    description: t('description', { title })
  }
}

export default async function AuditPage({
  params
}: PageProps<'/[locale]/audit'>) {
  const { locale } = await params
  const nextIntlLocale = locale as Locale
  setRequestLocale(nextIntlLocale)

  const electionAndBallots = await findFinishedElection()

  return <Audit {...electionAndBallots} />
}
