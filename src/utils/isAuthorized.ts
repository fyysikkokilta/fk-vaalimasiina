import { type JWTPayload, jwtVerify } from 'jose'

import { env } from '~/env'

interface AdminPayload extends JWTPayload {
  email: string
}

export default async function isAuthorized(
  jwt: string | undefined
): Promise<boolean> {
  if (!jwt || typeof jwt !== 'string' || jwt.trim().length === 0) {
    return false
  }

  try {
    const secret = new TextEncoder().encode(env.AUTH_SECRET)

    const { payload } = await jwtVerify(jwt, secret, {
      algorithms: ['HS256'],
      issuer: 'fk-vaalimasiina'
    })

    if (!payload || typeof payload !== 'object' || !('email' in payload)) {
      return false
    }

    const adminPayload = payload as AdminPayload

    return (
      typeof adminPayload.email === 'string' &&
      env.ADMIN_EMAILS.includes(adminPayload.email)
    )
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('JWT verification failed:', error)
    }

    return false
  }
}
