'use client'

import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

import TitleWrapper from '~/components/TitleWrapper'

export default function Login() {
  const t = useTranslations('Login')
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const handleGoogleSignIn = () => {
    window.location.href = '/api/auth/google'
  }

  const getErrorMessage = () => {
    switch (error) {
      case 'access_denied':
        return t('error_access_denied')
      case 'unauthorized':
        return t('error_unauthorized')
      case 'server_error':
        return t('error_server_error')
      case 'no_code':
        return t('error_no_code')
      default:
        return null
    }
  }

  return (
    <TitleWrapper title={t('title')}>
      <div className="flex justify-center">
        <div className="w-full max-w-md">
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-fk-black mb-6">{t('signin_description')}</p>
            </div>
            {error && (
              <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
                {getErrorMessage()}
              </div>
            )}

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
