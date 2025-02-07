import { createNavigation } from 'next-intl/navigation'
import { defineRouting } from 'next-intl/routing'

export enum Locale {
  en = 'en',
  fi = 'fi'
}

export const routing = defineRouting({
  locales: [Locale.en, Locale.fi],
  defaultLocale: Locale.en
})

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing)
