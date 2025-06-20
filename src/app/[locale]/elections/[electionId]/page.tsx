import { notFound } from 'next/navigation'
import { Locale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import ElectionResults from '~/components/ElectionResults'
import TitleWrapper from '~/components/TitleWrapper'
import { db } from '~/db'
import { Link } from '~/i18n/navigation'
import isUUID from '~/utils/isUUID'

export const dynamic = 'force-static'

const getElection = async (electionId: string) => {
  const election = await db.query.electionsTable.findFirst({
    columns: {
      status: false
    },
    where: (electionsTable, { and, eq }) =>
      and(
        eq(electionsTable.electionId, electionId),
        eq(electionsTable.status, 'CLOSED')
      ),
    with: {
      candidates: {
        columns: {
          candidateId: true,
          name: true
        }
      },
      ballots: {
        columns: {},
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
      },
      voters: {
        columns: {
          voterId: true
        }
      }
    }
  })

  if (!election) {
    return null
  }

  const { ballots, ...electionWithoutVotes } = election
  const voterCount = election.voters.length
  const electionWithoutVoters = {
    ...electionWithoutVotes,
    voters: undefined
  }
  return { election: electionWithoutVoters, ballots, voterCount }
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: Locale; electionId: string }>
}) {
  const { locale, electionId } = await params
  const t = await getTranslations({
    locale,
    namespace: 'metadata.election'
  })
  const electionBallotsVoterCount = await getElection(electionId)

  if (!electionBallotsVoterCount) {
    return null
  }

  const {
    election: { title }
  } = electionBallotsVoterCount
  return {
    title: t('title', { title }),
    description: t('description', { title })
  }
}

export default async function Election({
  params
}: {
  params: Promise<{ locale: Locale; electionId: string }>
}) {
  const { locale, electionId } = await params
  setRequestLocale(locale)

  if (!isUUID(electionId)) {
    notFound()
  }

  const electionBallotsVoterCount = await getElection(electionId)
  const t = await getTranslations('Election')

  if (!electionBallotsVoterCount) {
    notFound()
  }

  return (
    <TitleWrapper title={t('title')}>
      <div className="mb-5">
        <Link
          href="/elections"
          className="bg-fk-yellow text-fk-black rounded-lg px-4 py-3 transition-colors hover:bg-amber-500"
        >
          {t('back_to_list')}
        </Link>
      </div>
      <ElectionResults {...electionBallotsVoterCount} />
    </TitleWrapper>
  )
}

export type ElectionPageProps = NonNullable<
  Awaited<ReturnType<typeof getElection>>
>
