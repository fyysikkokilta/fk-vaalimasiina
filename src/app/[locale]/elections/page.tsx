import { unstable_cacheTag as cacheTag } from 'next/cache'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import React from 'react'

import TitleWrapper from '~/components/TitleWrapper'
import { db } from '~/db'
import { Link } from '~/i18n/navigation'

const getElections = async () => {
  'use cache'
  cacheTag('elections')
  return db.query.electionsTable.findMany({
    where: (electionsTable, { eq }) => eq(electionsTable.status, 'CLOSED')
  })
}

export default async function ElectionListPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const elections = await getElections()
  const t = await getTranslations('previous_results')

  return (
    <TitleWrapper title={t('title')}>
      {elections.length > 0 ? (
        <ul className="grid list-none grid-cols-1 place-items-center gap-4 p-0 md:grid-cols-3">
          {elections.map((election) => (
            <li
              key={election.electionId}
              className="w-full max-w-md rounded-lg border transition-colors hover:bg-gray-50"
            >
              <Link
                href={`/elections/${election.electionId}`}
                className="block px-4 py-3 text-center text-gray-900 hover:text-gray-700"
              >
                {election.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <>
          <span>{t('no_previous_results')}</span>
          <p>{t('no_previous_results_description')}</p>
        </>
      )}
    </TitleWrapper>
  )
}
