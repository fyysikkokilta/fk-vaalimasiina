import { Locale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { db } from '~/db'
import { env } from '~/env'

import Audit from './client'

const findFinishedElection = async () => {
  // For building without database access
  if (!env.DATABASE_URL) {
    return { election: null, ballots: [] }
  }

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

export type AuditPageProps = Awaited<ReturnType<typeof findFinishedElection>>
