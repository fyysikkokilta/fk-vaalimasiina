import { getTranslations } from 'next-intl/server'

import { getElections } from '~/data/getElections'

import ElectionListClient from './client'

export async function generateMetadata() {
  const t = await getTranslations('metadata.elections')
  return {
    title: t('title'),
    description: t('description')
  }
}

export default async function ElectionList() {
  const elections = await getElections()
  return <ElectionListClient elections={elections} />
}
