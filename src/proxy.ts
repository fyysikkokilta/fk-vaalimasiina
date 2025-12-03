import { NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'

import { routing } from './i18n/routing'
import isAuthorized, { JWT_COOKIE } from './utils/isAuthorized'

const intlMiddleware = createIntlMiddleware(routing)

function extractLocale(pathname: string) {
  // Regex to match locale at the start of the pathname
  // Matches /en/, /fi/, or just / (no locale)
  const localeRegex = /^\/(en|fi)(\/.*)?$/
  const match = pathname.match(localeRegex)

  if (match) {
    return match[1]
  }

  return null
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const locale = extractLocale(pathname) || routing.defaultLocale

  try {
    const adminToken = request.cookies.get(JWT_COOKIE)?.value
    const authorized = await isAuthorized(adminToken)

    // Redirect only if the path contains the locale
    // This way the locale is not lost
    if (!authorized && locale && pathname.startsWith(`/${locale}/admin`)) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url))
    }

    if (authorized && locale && pathname.startsWith(`/${locale}/login`)) {
      return NextResponse.redirect(new URL(`/${locale}/admin`, request.url))
    }

    return intlMiddleware(request)
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Middleware error:', error)
    }

    return intlMiddleware(request)
  }
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}
