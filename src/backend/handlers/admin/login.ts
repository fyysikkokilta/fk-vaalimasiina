import { Response, Router } from 'express'

import { RequestBody } from '../../../../types/express'
import { authenticateAdmin } from '../../routes/admin/login'

export type AuthenticateRequestBody = {
  username: string
  password: string
}
export const authenticate = (
  req: RequestBody<AuthenticateRequestBody>,
  res: Response
) => {
  const { username, password } = req.body
  const jwt = authenticateAdmin(username, password)

  if (!jwt) {
    res.status(401).json({ key: 'invalid_credentials' })
    return
  }

  res.json(jwt)
}

const router = Router()

router.use('/', (req: RequestBody<AuthenticateRequestBody>, res, next) => {
  const { username, password } = req.body

  if (!username || !password) {
    res.status(401).json({ key: 'missing_username_or_password' })
    return
  }

  next()
})

router.post('/', authenticate)

export default router
