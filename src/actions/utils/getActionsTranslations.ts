import { cookies } from 'next/headers'
import { getTranslations } from 'next-intl/server'

import { routing } from '~/i18n/routing'

export async function getActionsTranslations(
  namespace: Required<
    NonNullable<Parameters<typeof getTranslations>[0]>
  >['namespace']
) {
  const cookieStore = await cookies()
  const locale = (cookieStore.get('NEXT_LOCALE')?.value ||
    routing.defaultLocale) as 'en' | 'fi'
  return getTranslations({
    locale,
    namespace
  })
}
