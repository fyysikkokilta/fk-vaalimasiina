import { notFound } from 'next/navigation'
import { Locale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { db } from '~/db'
import isUUID from '~/utils/isUUID'

import Vote from './client'

export const generateStaticParams = () => {
  // SSG with empty array in generateStaticParams doesn't work for some reason
  // This is a workaround to make it work
  return [{ voterId: '00000000-0000-0000-0000-000000000000' }]
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
