import { Locale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { db } from '~/db'
import { env } from '~/env'

import ElectionListClient from './client'

const getElections = async () => {
  // For building without database access
  // This generates empty pages and *.meta files need to be removed to generate them properly
  if (!env.DATABASE_URL) {
    return []
  }

  return db.query.electionsTable.findMany({
    where: (electionsTable, { eq }) => eq(electionsTable.status, 'CLOSED'),
    orderBy: (electionsTable, { desc }) => desc(electionsTable.date)
  })
}

export async function generateMetadata({
  params
}: PageProps<'/[locale]/elections'>) {
  const { locale } = await params
  const nextIntlLocale = locale as Locale
  const t = await getTranslations({
    locale: nextIntlLocale,
    namespace: 'metadata.elections'
  })
  return {
    title: t('title'),
    description: t('description')
  }
}

export default async function ElectionList({
  params
}: PageProps<'/[locale]/elections'>) {
  const { locale } = await params
  const nextIntlLocale = locale as Locale
  setRequestLocale(nextIntlLocale)

  const elections = await getElections()

  return <ElectionListClient elections={elections} />
}
