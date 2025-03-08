import { useTranslations } from 'next-intl'
import React from 'react'

export default function LoadingSpinner() {
  const t = useTranslations('LoadingSpinner')
  return (
    <div className="m-0 rounded-md border bg-gray-100 p-5 text-center shadow-sm">
      <div className="flex flex-col items-center">
        <div className="h-16 w-16 animate-spin rounded-full border-t-4 border-blue-500"></div>
        <div className="mt-3 font-bold">
          {t('loading')}
          {'...'}
        </div>
      </div>
    </div>
  )
}
