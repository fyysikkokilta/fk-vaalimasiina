/* eslint-disable no-restricted-imports */

import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { Suspense } from 'react'

import { getPublicOAuthProviders } from '~/auth/get-oauth-providers'
import LoginError from '~/components/LoginError'
import TitleWrapper from '~/components/TitleWrapper'

export async function generateMetadata() {
  const t = await getTranslations('metadata.login')
  return {
    title: t('title'),
    description: t('description')
  }
}

export default async function LoginPage() {
  const t = await getTranslations('Login')
  const providers = getPublicOAuthProviders()

  if (providers.length === 0) {
    return (
      <TitleWrapper title={t('title')}>
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <div className="space-y-4">
              <div className="text-center">
                <p className="mb-6 text-red-600">
                  {t('no_providers_configured')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </TitleWrapper>
    )
  }

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
            <div className="space-y-3">
              {providers.map((provider) => (
                <Link
                  key={provider.id}
                  href={`/api/auth/${provider.id}`}
                  className="bg-fk-yellow text-fk-black flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg px-4 py-2 font-medium transition-colors hover:bg-amber-500 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {t('signin_with', { provider: provider.displayName })}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </TitleWrapper>
  )
}
