import jsonwebtoken from 'jsonwebtoken'

import { env } from '~/env'

export const authenticate = () => {
  const username = env.ADMIN_USERNAME

  return jsonwebtoken.sign({ username }, env.JWT_SECRET, {
    expiresIn: '10h'
  })
}
