import jsonwebtoken from 'jsonwebtoken'

import { env } from '~/env'

export default function isAuthorized(jwt: string | undefined) {
  if (!jwt) {
    return false
  }
  try {
    const payload = jsonwebtoken.verify(jwt, env.JWT_SECRET) as {
      username: string
    }

    return payload.username === env.ADMIN_USERNAME
  } catch {
    return false
  }
}
