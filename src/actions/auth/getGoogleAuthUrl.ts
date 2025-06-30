'use server'

import { env } from '~/env'

export function getGoogleAuthUrl(): string {
  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  googleAuthUrl.searchParams.set('client_id', env.GOOGLE_CLIENT_ID)
  googleAuthUrl.searchParams.set(
    'redirect_uri',
    `${env.BASE_URL}/api/auth/google`
  )
  googleAuthUrl.searchParams.set('response_type', 'code')
  googleAuthUrl.searchParams.set('scope', 'openid email profile')
  googleAuthUrl.searchParams.set('access_type', 'offline')

  return googleAuthUrl.toString()
}
