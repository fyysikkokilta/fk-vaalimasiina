import { unstable_cacheTag as cacheTag } from 'next/cache'
import { Locale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { db } from '~/db'

import Audit from './client'

const findFinishedElection = async () => {
  'use cache'
  cacheTag('auditable-election')
  const election = await db.query.electionsTable.findFirst({
    columns: {
      status: false
    },
    where: (electionsTable, { eq }) => eq(electionsTable.status, 'FINISHED'),
    with: {
      candidates: {
        columns: {
          candidateId: true,
          name: true
        }
      },
      ballots: {
        columns: {
          ballotId: true
        },
        with: {
          votes: {
            columns: {
              candidateId: true,
              rank: true
            }
          }
        },
        // BallotId is random, so this makes the order not the same as order of creation
        orderBy: (ballotsTable) => ballotsTable.ballotId
      }
    }
  })

  if (!election) {
    return { election: null, ballots: [] }
  }

  const { ballots, ...electionWithoutVotes } = election
  return { election: electionWithoutVotes, ballots }
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const t = await getTranslations({
    locale,
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
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const electionAndBallots = await findFinishedElection()

  return <Audit {...electionAndBallots} />
}

export type AuditPageProps = Awaited<ReturnType<typeof findFinishedElection>>
