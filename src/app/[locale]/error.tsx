'use client'

import { useTranslations } from 'next-intl'
import React, { useEffect, useRef } from 'react'

import { usePathname, useRouter } from '~/i18n/navigation'

export default function ErrorFallback({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations()
  const pathName = usePathname()
  const router = useRouter()
  const errorLocation = useRef(pathName)

  useEffect(() => {
    if (pathName !== errorLocation.current) {
      reset()
    }
  }, [pathName, reset])

  return (
    <div
      className="relative m-0 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
      role="alert"
    >
      <h2 className="text-lg font-semibold">{t('error_boundary.title')}</h2>
      <p>{t('error_boundary.message')}</p>
      {!!error.message && (
        <>
          <p>
            {t('error_boundary.error_message')}
            {': '}
            {t.has(error.message) ? t(error.message) : error.message}
          </p>
        </>
      )}
      <div className="mt-2 space-x-2">
        <button
          className="cursor-pointer rounded-md bg-gray-500 px-4 py-2 text-white"
          onClick={() => reset()}
        >
          {t('error_boundary.reload')}
        </button>
        <button
          className="bg-fk-yellow text-fk-black mt-2 cursor-pointer rounded-md px-4 py-2 transition-colors hover:bg-amber-500"
          onClick={() => router.push('/')}
        >
          {t('error_boundary.back_to_frontpage')}
        </button>
      </div>
    </div>
  )
}
