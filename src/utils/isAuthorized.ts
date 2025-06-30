import { jwtVerify } from 'jose'

import { env } from '~/env'

export const JWT_COOKIE = 'admin-token'

export default async function isAuthorized(jwt: string | undefined) {
  if (!jwt || typeof jwt !== 'string' || jwt.trim().length === 0) {
    return false
  }

  try {
    const secret = new TextEncoder().encode(env.AUTH_SECRET)

    const { payload } = await jwtVerify(jwt, secret, {
      algorithms: ['HS256'],
      issuer: 'fk-vaalimasiina'
    })

    if (!payload || typeof payload !== 'object' || !('user' in payload)) {
      return false
    }

    const adminPayload = payload.user as { email: string; name: string }

    // Allow test email in test and development environments for testing
    if (
      (env.NODE_ENV === 'test' || env.NODE_ENV === 'development') &&
      adminPayload.email === 'test@email.com'
    ) {
      return true
    }

    // Check if email is in the admin emails list
    return env.ADMIN_EMAILS.includes(adminPayload.email)
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('JWT verification failed:', error)
    }

    return false
  }
}
