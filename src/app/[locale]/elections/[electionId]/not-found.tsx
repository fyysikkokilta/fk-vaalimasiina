import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

import TitleWrapper from '~/components/TitleWrapper'

export default async function ElectionNotFound() {
  const t = await getTranslations('previous_results.not_found')

  return (
    <TitleWrapper title={t('title')}>
      <p className="mb-5 text-lg text-gray-700">{t('description')}</p>
      <Link
        href="/"
        className="bg-fk-yellow text-fk-black inline-block rounded-lg px-4 py-2 transition-colors hover:bg-amber-500"
      >
        {t('back_to_frontpage')}
      </Link>
    </TitleWrapper>
  )
}
