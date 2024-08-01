import { sha512 } from 'js-sha512'
import jsonwebtoken from 'jsonwebtoken'

export const authenticateAdmin = async (username: string, password: string) => {
  const adminUsername = process.env.ADMIN_USERNAME!
  const adminPassword = process.env.ADMIN_PASSWORD!

  //TODO: If NODE_ENV is not production, use "admin", "password" credentials and "secret" secret key
  const hashed = sha512(password + process.env.SECRET_KEY)

  if (adminUsername !== username || adminPassword !== hashed) {
    return null
  }

  return jsonwebtoken.sign({ username }, process.env.JWT_SECRET!, {
    expiresIn: '10h',
  })
}
