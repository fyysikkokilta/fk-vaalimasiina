import * as rootParams from 'next/root-params'
import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'

import { routing } from './routing'

export default getRequestConfig(async ({ locale }) => {
  // If locale is not provided, use the locale from the root params
  // Server actions don't have access to root params, so we need to use the passed locale instead
  if (!locale) {
    const paramValue = await rootParams.locale()
    locale = hasLocale(routing.locales, paramValue)
      ? paramValue
      : routing.defaultLocale
  }

  return {
    locale,
    messages: (
      (await import(`../../messages/${locale}.json`)) as {
        default: Record<string, string>
      }
    ).default
  }
})
