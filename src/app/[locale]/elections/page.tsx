import { Locale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import TitleWrapper from '~/components/TitleWrapper'
import { db } from '~/db'
import { Link } from '~/i18n/navigation'

const getElections = async () => {
  return db.query.electionsTable.findMany({
    where: (electionsTable, { eq }) => eq(electionsTable.status, 'CLOSED'),
    orderBy: (electionsTable, { desc }) => desc(electionsTable.date)
  })
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  const t = await getTranslations({
    locale,
    namespace: 'metadata.elections'
  })
  return {
    title: t('title'),
    description: t('description')
  }
}

export default async function ElectionList({
  params
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const elections = await getElections()
  const t = await getTranslations('ElectionList')

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
                <div className="font-medium">{election.title}</div>
                <div className="mt-1 text-sm text-gray-500">
                  {election.date.toLocaleDateString(locale)}
                </div>
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
