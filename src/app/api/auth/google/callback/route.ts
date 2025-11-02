import { SignJWT } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

import { env } from '~/env'
import { redirect } from '~/i18n/navigation'
import { routing } from '~/i18n/routing'
import { JWT_COOKIE } from '~/utils/isAuthorized'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const locale = (cookieStore.get('NEXT_LOCALE')?.value ||
    routing.defaultLocale) as 'en' | 'fi'
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code') || ''
  const error = searchParams.get('error')

  if (error) {
    redirect({ href: '/login?error=access_denied', locale })
  }

  if (!code) {
    redirect({ href: '/login?error=no_code', locale })
  }

  // Exchange code for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`
    })
  })

  if (!tokenResponse.ok) {
    redirect({ href: '/login?error=server_error', locale })
  }

  const tokenData = (await tokenResponse.json()) as {
    access_token: string
  }

  // Get user info from Google
  const userResponse = await fetch(
    'https://www.googleapis.com/oauth2/v2/userinfo',
    {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    }
  )

  if (!userResponse.ok) {
    redirect({ href: '/login?error=unauthorized', locale })
  }

  const user = (await userResponse.json()) as {
    email: string
    name: string
  }

  // Check if user is authorized (email is in admin emails list)
  if (!env.ADMIN_EMAILS.includes(user.email)) {
    redirect({ href: '/login?error=unauthorized', locale })
  }

  // Create JWT token
  const jwt = await new SignJWT({ user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('fk-vaalimasiina')
    .setExpirationTime('8h')
    .sign(new TextEncoder().encode(env.AUTH_SECRET))

  // Set cookie and redirect to admin page
  cookieStore.set(JWT_COOKIE, jwt, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8
  })

  redirect({ href: '/admin', locale })
}
