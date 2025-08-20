import { Locale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import TitleWrapper from '~/components/TitleWrapper'

export default async function Info({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params
  setRequestLocale(locale as Locale)

  const t = await getTranslations('Info')

  return (
    <TitleWrapper title={t('title')}>
      <p className="mb-2 text-gray-700">{t('info')}</p>
      <p className="mb-2 text-gray-700">{t('info_2')}</p>
      <p className="mb-2 text-gray-700">{t('info_3')}</p>
    </TitleWrapper>
  )
}
