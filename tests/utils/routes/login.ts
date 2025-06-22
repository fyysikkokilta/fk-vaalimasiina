import { SignJWT } from 'jose'

import { env } from '~/env'

export const authenticate = async () => {
  const username = env.ADMIN_USERNAME
  const secret = new TextEncoder().encode(env.JWT_SECRET)

  return new SignJWT({ username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('10h')
    .setIssuer('fk-vaalimasiina')
    .setAudience('admin')
    .sign(secret)
}
