import { Router, Request, Response } from 'express'

import { login, logout } from '../routes/login'
import { getVoterStatus, getVoterStatusWithIdentifier } from '../routes/voter'
import { validateUuid, validateVoterCode } from '../validation/validation'

export const handleLogin = async (req: Request, res: Response) => {
  const { alias, identifier } = req.body

  const validVoter = await getVoterStatusWithIdentifier(identifier)

  if (!validVoter) {
    res.status(401).json({ key: 'voter_not_found' })
    return
  }

  if (!validVoter.active) {
    res.status(401).json({ key: 'voter_not_active' })
    return
  }

  if (validVoter.loggedIn) {
    res.status(401).json({ key: 'voter_already_logged_in' })
    return
  }

  const loggedInVoter = await login(identifier, alias)
  res.status(200).json(loggedInVoter)
}

export const handleLogout = async (req: Request, res: Response) => {
  const { voterId } = req.body

  const validVoter = await getVoterStatus(voterId)

  if (!validVoter) {
    res.status(401).json({ key: 'voter_not_found' })
    return
  }

  if (!validVoter.active) {
    res.status(401).json({ key: 'voter_not_active' })
    return
  }

  if (!validVoter.loggedIn) {
    res.status(401).json({ key: 'voter_not_logged_in' })
    return
  }

  const loggedOutVoter = await logout(voterId)
  res.status(200).json(loggedOutVoter)
}

const router = Router()

router.use('/login', (req, res, next) => {
  const { identifier } = req.body
  if (!validateVoterCode(identifier)) {
    res.status(400).json({ key: 'invalid_voter_code' })
    return
  }
  next()
})

router.post('/login', handleLogin)

router.use('/logout', (req, res, next) => {
  const { voterId } = req.body
  if (!validateUuid(voterId)) {
    res.status(400).json({ key: 'invalid_voter_id' })
    return
  }
  next()
})

router.post('/logout', handleLogout)

export default router
