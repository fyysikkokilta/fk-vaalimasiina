import { NextResponse } from 'next/server'

import { env } from '~/env'

export function GET() {
  // Build Google OAuth authorization URL
  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  googleAuthUrl.searchParams.set('client_id', env.GOOGLE_CLIENT_ID)
  googleAuthUrl.searchParams.set(
    'redirect_uri',
    `${env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`
  )
  googleAuthUrl.searchParams.set('response_type', 'code')
  googleAuthUrl.searchParams.set('scope', 'openid email profile')
  googleAuthUrl.searchParams.set('access_type', 'offline')

  // Redirect to Google OAuth
  return NextResponse.redirect(googleAuthUrl.toString())
}
