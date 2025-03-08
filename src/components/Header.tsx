import { getTranslations } from 'next-intl/server'
import React from 'react'

import { Link } from '~/i18n/navigation'

import LanguageSwitcher from './LanguageSwitcher'

function HeaderLink({
  href,
  children
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="rounded-lg px-4 py-3 text-white transition-colors hover:bg-white/10 hover:text-white/90"
    >
      {children}
    </Link>
  )
}

export default async function Header() {
  const APP_TITLE = process.env.NEXT_PUBLIC_BRANDING_HEADER_TITLE_TEXT
  const APP_TITLE_SHORT =
    process.env.NEXT_PUBLIC_BRANDING_HEADER_TITLE_SHORT_TEXT

  const t = await getTranslations('Header')
  return (
    <header className="bg-fk-black shadow-md">
      <div className="container m-auto flex items-center justify-between px-5 py-2">
        <h1 className="hidden text-xl text-white md:flex">{APP_TITLE}</h1>
        <h1 className="text-xl text-white md:hidden">{APP_TITLE_SHORT}</h1>
        <nav className="ml-3 hidden flex-1 items-center justify-between md:flex">
          <div className="flex">
            <HeaderLink href="/">{t('main')}</HeaderLink>
            <HeaderLink href="/audit">{t('audit')}</HeaderLink>
            <HeaderLink href="/elections">{t('previous_results')}</HeaderLink>
            <HeaderLink href="/admin">{t('admin')}</HeaderLink>
          </div>
          <div>
            <LanguageSwitcher />
          </div>
        </nav>
        <div className="relative mr-2 md:hidden">
          <input type="checkbox" id="nav-toggle" className="peer hidden" />
          <label
            htmlFor="nav-toggle"
            className="block cursor-pointer p-2 text-white"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </label>
          <div className="bg-fk-black invisible absolute right-0 z-10 mt-2 flex w-48 flex-col rounded-b-lg px-3 py-2 opacity-0 shadow-lg transition-all duration-200 peer-checked:visible peer-checked:opacity-100">
            <HeaderLink href="/">{t('main')}</HeaderLink>
            <HeaderLink href="/audit">{t('audit')}</HeaderLink>
            <HeaderLink href="/elections">{t('previous_results')}</HeaderLink>
            <HeaderLink href="/admin">{t('admin')}</HeaderLink>
            <div className="my-2 border-t border-white/10"></div>
            <div className="px-4 py-2 text-center">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
