import { notFound } from 'next/navigation'
import { Locale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { db } from '~/db'
import isUUID from '~/utils/isUUID'

import Vote from './client'

export const generateStaticParams = () => {
  // Generate all paths statically when first visited

  // Currently it seems that empty array causes the route to not work at all
  // What happens is that even valid voterId gives 500 error
  return [{ voterId: 'voterId' }]
}

const getVoter = async (voterId: string) => {
  const voter = await db.query.votersTable.findFirst({
    columns: {
      voterId: true
    },
    where: (votersTable, { eq }) => eq(votersTable.voterId, voterId),
    with: {
      election: {
        with: {
          candidates: {
            columns: {
              candidateId: true,
              name: true
            }
          }
        }
      },
      hasVoted: {
        columns: {
          hasVotedId: true
        }
      }
    }
  })
  if (!voter) {
    return null
  }
  const { election, ...voterWithoutElections } = voter
  return { voter: voterWithoutElections, election }
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const t = await getTranslations({
    locale,
    namespace: 'metadata.vote'
  })
  return {
    title: t('title'),
    description: t('description')
  }
}

export default async function VotePage({
  params
}: {
  params: Promise<{ locale: Locale; voterId: string }>
}) {
  const { locale, voterId } = await params
  setRequestLocale(locale)

  if (!isUUID(voterId)) {
    notFound()
  }

  const voterElection = await getVoter(voterId)

  if (!voterElection) {
    notFound()
  }

  return <Vote {...voterElection} />
}

export type VotePageProps = NonNullable<Awaited<ReturnType<typeof getVoter>>>
