import { notFound } from 'next/navigation'
import { Locale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import ElectionResults from '~/components/ElectionResults'
import TitleWrapper from '~/components/TitleWrapper'
import { getElection } from '~/data/getElection'
import { Link } from '~/i18n/navigation'
import isUUID from '~/utils/isUUID'

export function generateStaticParams() {
  // Enable SSG
  // Placeholder needed to circumvent DYNAMIC_SERVER_USAGE errors
  return [{ electionId: '00000000-0000-0000-0000-000000000000' }]
}

export async function generateMetadata({
  params
}: PageProps<'/[locale]/elections/[electionId]'>) {
  const { locale, electionId } = await params
  const nextIntlLocale = locale as Locale
  const t = await getTranslations({
    locale: nextIntlLocale,
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
}: PageProps<'/[locale]/elections/[electionId]'>) {
  const { locale, electionId } = await params
  const nextIntlLocale = locale as Locale
  setRequestLocale(nextIntlLocale)

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
