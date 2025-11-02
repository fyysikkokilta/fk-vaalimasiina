import { Locale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import TitleWrapper from '~/components/TitleWrapper'
import { getAdminElection } from '~/data/getAdminElection'

import Admin from './client'

export async function generateMetadata({
  params
}: PageProps<'/[locale]/admin'>) {
  const { locale } = await params
  const nextIntlLocale = locale as Locale
  const t = await getTranslations({
    locale: nextIntlLocale,
    namespace: 'metadata.admin'
  })
  return {
    title: t('title'),
    description: t('description')
  }
}

export default async function AdminPage({
  params
}: PageProps<'/[locale]/admin'>) {
  const { locale } = await params
  const nextIntlLocale = locale as Locale
  setRequestLocale(nextIntlLocale)

  const t = await getTranslations('Admin')

  const adminElection = await getAdminElection()

  return (
    <TitleWrapper title={t('title')}>
      <Admin adminElection={adminElection} />
    </TitleWrapper>
  )
}
