import jsonwebtoken from 'jsonwebtoken'

export const authenticateAdmin = async (username: string, password: string) => {
  const adminUsername = process.env.ADMIN_USERNAME!
  const adminPassword = process.env.ADMIN_PASSWORD!

  if (process.env.NODE_ENV === 'development') {
    if (username === 'admin' && password === 'password') {
      return jsonwebtoken.sign({ username }, process.env.JWT_SECRET!, {
        expiresIn: '10h'
      })
    }
  }

  if (adminUsername !== username || adminPassword !== password) {
    return null
  }

  return jsonwebtoken.sign({ username }, process.env.JWT_SECRET!, {
    expiresIn: '10h'
  })
}
