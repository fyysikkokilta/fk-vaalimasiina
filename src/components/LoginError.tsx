'use client'

import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

export default function LoginError() {
  const t = useTranslations('Login')
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

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

  return error ? (
    <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
      {getErrorMessage()}
    </div>
  ) : null
}
