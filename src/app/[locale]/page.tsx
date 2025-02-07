import { getTranslations, setRequestLocale } from 'next-intl/server'
import React from 'react'

import TitleWrapper from '~/components/TitleWrapper'

export default async function Info({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations('voter.info')

  return (
    <TitleWrapper title={t('title')}>
      <p className="mb-2 text-gray-700">{t('info')}</p>
      <p className="mb-2 text-gray-700">{t('info_2')}</p>
      <p className="mb-2 text-gray-700">{t('info_3')}</p>
    </TitleWrapper>
  )
}
