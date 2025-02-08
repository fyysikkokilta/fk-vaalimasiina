import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import React from 'react'

import { calculateSTVResult } from '~/algorithm/stvAlgorithm'
import ElectionResults from '~/components/ElectionResults'
import TitleWrapper from '~/components/TitleWrapper'
import { db } from '~/db'
import { Link } from '~/i18n/routing'
import { trpc } from '~/trpc/server'
import isUUID from '~/utils/isUUID'

export const generateStaticParams = async () => {
  const elections = await db.query.electionsTable.findMany({
    where: (electionsTable, { eq }) => eq(electionsTable.status, 'CLOSED'),
    columns: {
      electionId: true
    }
  })

  return elections
}

export default async function PreviousResults({
  params
}: {
  params: Promise<{ locale: string; electionId: string }>
}) {
  const { locale, electionId } = await params
  setRequestLocale(locale)

  if (!isUUID(electionId)) {
    notFound()
  }

  const electionBallotsVoterCount = await trpc.elections.getCompletedWithId({
    electionId
  })
  const t = await getTranslations('previous_results')

  if (!electionBallotsVoterCount) {
    notFound()
  }

  const { election, ballots, voterCount } = electionBallotsVoterCount

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
      <ElectionResults
        election={election}
        votingResult={calculateSTVResult(election, ballots, voterCount)}
      />
    </TitleWrapper>
  )
}
