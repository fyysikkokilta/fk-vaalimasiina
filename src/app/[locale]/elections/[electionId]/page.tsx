import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'

import ElectionResults from '~/components/ElectionResults'
import TitleWrapper from '~/components/TitleWrapper'
import { getElection } from '~/data/getElection'
import { Link } from '~/i18n/navigation'
import isUUID from '~/utils/isUUID'

export function generateStaticParams() {
  return []
}

export async function generateMetadata({
  params
}: PageProps<'/[locale]/elections/[electionId]'>) {
  const { electionId } = await params
  const t = await getTranslations('metadata.election')
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
  const { electionId } = await params

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
      <ElectionResults
        {...electionBallotsVoterCount}
        showAllImmediately={true}
      />
    </TitleWrapper>
  )
}
