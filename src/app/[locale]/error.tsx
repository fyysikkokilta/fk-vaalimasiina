'use client'

import { useTranslations } from 'next-intl'
import { useEffect, useRef } from 'react'

import { Button } from '~/components/ui/Button'
import { usePathname, useRouter } from '~/i18n/navigation'

export default function ErrorBoundary({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('ErrorBoundary')
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
      <h2 className="text-lg font-semibold">{t('title')}</h2>
      <p>{t('message')}</p>
      {!!error.message && (
        <>
          <p>
            {t('error_message')}
            {': '}
            {/* @ts-expect-error -- `error.message` is not typed */}
            {t.has(error.message) ? t(error.message) : error.message}
          </p>
        </>
      )}
      <div className="mt-2 space-x-2">
        <Button variant="secondary" onClick={() => reset()}>
          {t('reload')}
        </Button>
        <Button variant="yellow" onClick={() => router.push('/')}>
          {t('back_to_frontpage')}
        </Button>
      </div>
    </div>
  )
}
