import { notFound } from 'next/navigation'
import { Locale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { db } from '~/db'
import { env } from '~/env'
import isUUID from '~/utils/isUUID'

import Vote from './client'

export const generateStaticParams = async () => {
  // Enable SSG
  return Promise.resolve([{ voterId: '__placeholder__' }])
}

const getVoter = async (voterId: string) => {
  // For building without database access
  if (!env.DATABASE_URL) {
    return null
  }

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
}: PageProps<'/[locale]/vote/[voterId]'>) {
  const { locale } = await params
  const nextIntlLocale = locale as Locale
  const t = await getTranslations({
    locale: nextIntlLocale,
    namespace: 'metadata.vote'
  })
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

export type VotePageProps = NonNullable<Awaited<ReturnType<typeof getVoter>>>
