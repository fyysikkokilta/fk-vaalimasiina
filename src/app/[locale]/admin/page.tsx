import { getTranslations } from 'next-intl/server'

import TitleWrapper from '~/components/TitleWrapper'
import { getAdminElection } from '~/data/getAdminElection'

import Admin from './client'

export async function generateMetadata() {
  const t = await getTranslations('metadata.admin')
  return {
    title: t('title'),
    description: t('description')
  }
}

export default async function AdminPage() {
  const t = await getTranslations('Admin')

  const adminElection = await getAdminElection()

  return (
    <TitleWrapper title={t('title')}>
      <Admin adminElection={adminElection} />
    </TitleWrapper>
  )
}
