/* eslint-disable no-restricted-imports */

import Link from 'next/link'
import { Locale } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Suspense } from 'react'

import LoginError from '~/components/LoginError'
import TitleWrapper from '~/components/TitleWrapper'

export async function generateMetadata({
  params
}: PageProps<'/[locale]/login'>) {
  const { locale } = await params
  const nextIntlLocale = locale as Locale
  const t = await getTranslations({
    locale: nextIntlLocale,
    namespace: 'metadata.login'
  })
  return {
    title: t('title'),
    description: t('description')
  }
}

export default async function LoginPage({
  params
}: PageProps<'/[locale]/login'>) {
  const { locale } = await params
  const nextIntlLocale = locale as Locale
  setRequestLocale(nextIntlLocale)

  const t = await getTranslations('Login')

  return (
    <TitleWrapper title={t('title')}>
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-fk-black mb-6">{t('signin_description')}</p>
            </div>
            <Suspense>
              <LoginError />
            </Suspense>
            <Link
              href="/api/auth/google"
              className="bg-fk-yellow text-fk-black flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg px-4 py-2 font-medium transition-colors hover:bg-amber-500 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {t('signin_with_google')}
            </Link>
          </div>
        </div>
      </div>
    </TitleWrapper>
  )
}
