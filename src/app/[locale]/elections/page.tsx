import { Locale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { db } from '~/db'

import ElectionListClient from './client'

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

  return <ElectionListClient elections={elections} />
}
