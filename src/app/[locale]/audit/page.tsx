import { getTranslations } from 'next-intl/server'

import { findFinishedElection } from '~/data/findFinishedElection'

import Audit from './client'

export async function generateMetadata() {
  const t = await getTranslations('metadata.audit')
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

export default async function AuditPage() {
  const electionAndBallots = await findFinishedElection()

  return <Audit {...electionAndBallots} />
}
