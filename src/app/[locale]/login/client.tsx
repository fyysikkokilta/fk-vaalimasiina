'use client'

import { useTranslations } from 'next-intl'
import { Suspense } from 'react'

import LoginError from '~/components/LoginError'
import TitleWrapper from '~/components/TitleWrapper'

export default function Login() {
  const t = useTranslations('Login')

  const handleGoogleSignIn = () => {
    window.location.href = '/api/auth/google'
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

            <button
              onClick={handleGoogleSignIn}
              className="bg-fk-yellow text-fk-black flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg px-4 py-2 font-medium transition-colors hover:bg-amber-500 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {t('signin_with_google')}
            </button>
          </div>
        </div>
      </div>
    </TitleWrapper>
  )
}
