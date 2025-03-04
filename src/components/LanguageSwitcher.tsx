'use client'

import { useParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import React, { useTransition } from 'react'

import { usePathname, useRouter } from '~/i18n/navigation'

export default function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const [isPending, startTransition] = useTransition()
  const isEnglish = locale === 'en'

  const toggleLanguage = () => {
    const newLocale = isEnglish ? 'fi' : 'en'
    startTransition(() => {
      // @ts-expect-error -- TypeScript will validate that only known `params`
      // are used in combination with a given `pathname`. Since the two will
      // always match for the current route, we can skip runtime checks.
      router.replace({ pathname, params }, { locale: newLocale })
    })
  }

  return (
    <button
      className="cursor-pointer rounded-lg border-1 border-amber-50 px-4 py-2 text-white transition-colors hover:bg-white/10 hover:text-white/90"
      disabled={isPending}
      type="button"
      onClick={toggleLanguage}
    >
      {isEnglish ? 'Suomeksi' : 'In English'}
    </button>
  )
}
