import jsonwebtoken from 'jsonwebtoken'

export const authenticate = () => {
  const username = process.env.ADMIN_USERNAME!

  return jsonwebtoken.sign({ username }, process.env.JWT_SECRET!, {
    expiresIn: '10h'
  })
}
