import { getTranslations, setRequestLocale } from 'next-intl/server'
import React from 'react'

import TitleWrapper from '~/components/TitleWrapper'
import { Link } from '~/i18n/routing'
import { trpc } from '~/trpc/server'

export default async function PreviousElectionList({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const elections = await trpc.elections.getAllClosed()
  const t = await getTranslations('previous_results')

  return (
    <TitleWrapper title={t('title')}>
      {elections.length > 0 ? (
        <div>
          <ul className="space-y-2">
            {elections.map((election) => (
              <li
                key={election.electionId}
                className="rounded-lg border transition-colors hover:bg-gray-50"
              >
                <Link
                  href={`/elections/${election.electionId}`}
                  className="block p-4 text-center text-gray-900 hover:text-gray-700"
                >
                  {election.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <span>{t('no_previous_results')}</span>
          <p>{t('no_previous_results_description')}</p>
        </div>
      )}
    </TitleWrapper>
  )
}
