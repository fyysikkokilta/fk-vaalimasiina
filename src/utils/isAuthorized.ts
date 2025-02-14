import jsonwebtoken from 'jsonwebtoken'

export default function isAuthorized(jwt: string | undefined) {
  if (!jwt) {
    return false
  }
  try {
    const payload = jsonwebtoken.verify(jwt, process.env.JWT_SECRET!) as {
      username: string
    }

    return payload.username === process.env.ADMIN_USERNAME
  } catch {
    return false
  }
}
