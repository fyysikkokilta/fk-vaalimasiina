import { Router, Request, Response } from 'express'
import { authenticateAdmin } from '../../routes/admin/login'

export const authenticate = async (req: Request, res: Response) => {
  const { username, password } = req.body
  const jwt = await authenticateAdmin(username, password)

  if (!jwt) {
    res.status(401).json({ key: 'invalid_credentials' })
    return
  }

  res.json(jwt)
}

const router = Router()

router.use('/', (req, res, next) => {
  const { username, password } = req.body

  if (!username || !password) {
    res.status(401).json({ key: 'missing_username_or_password' })
    return
  }

  next()
})

router.post('/', authenticate)

export default router
