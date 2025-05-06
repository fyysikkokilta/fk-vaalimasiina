import { cookies } from 'next/headers'
import { Locale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import TitleWrapper from '~/components/TitleWrapper'
import { getDb } from '~/db'
import { redirect } from '~/i18n/navigation'
import isAuthorized from '~/utils/isAuthorized'

import Admin from './client'

const getAdminElection = async () => {
  const elections = await getDb().query.electionsTable.findMany({
    where: (electionsTable, { eq, not }) =>
      not(eq(electionsTable.status, 'CLOSED')),
    with: {
      candidates: {
        columns: {
          candidateId: true,
          name: true
        }
      },
      voters: {
        columns: {},
        with: {
          hasVoted: {
            columns: {
              hasVotedId: true
            }
          }
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
      }
    }
  })

  if (elections.length === 0) {
    return null
  }

  const { voters, ballots, ...election } = elections[0]

  return {
    election,
    voters,
    ballots
  }
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const t = await getTranslations({
    locale,
    namespace: 'metadata.admin'
  })
  return {
    title: t('title'),
    description: t('description')
  }
}

export default async function AdminPage({
  params
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('Admin')

  const cookieStore = await cookies()
  const value = cookieStore.get('admin-token')?.value
  const authorized = isAuthorized(value)
  if (!authorized) {
    redirect({
      href: '/login',
      locale
    })
  }

  const adminElection = await getAdminElection()

  return (
    <TitleWrapper title={t('title')}>
      <Admin adminElection={adminElection} />
    </TitleWrapper>
  )
}

export type AdminPageProps = Awaited<ReturnType<typeof getAdminElection>>

export type ElectionStepProps = NonNullable<AdminPageProps>
