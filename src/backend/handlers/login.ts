import { Router, Request, Response } from 'express'

import { login, logout } from '../routes/login'
import { getVoterStatus, getVoterStatusWithIdentifier } from '../routes/voter'
import { validateUuid, validateVoterCode } from '../validation/validation'

export const handleLogin = async (req: Request, res: Response) => {
  const { alias, identifier } = req.body

  const validVoter = await getVoterStatusWithIdentifier(identifier)

  if (!validVoter) {
    res.status(401).json({ message: 'Voter not found' })
    return
  }

  if (!validVoter.active) {
    res.status(401).json({ message: 'Voter is not active' })
    return
  }

  if (validVoter.loggedIn) {
    res.status(401).json({ message: 'Voter is already logged in' })
    return
  }

  const loggedInVoter = await login(identifier, alias)
  res.status(200).json(loggedInVoter)
}

export const handleLogout = async (req: Request, res: Response) => {
  const { voterId } = req.body

  const validVoter = await getVoterStatus(voterId)

  if (!validVoter) {
    res.status(401).json({ message: 'Voter not found' })
    return
  }

  if (!validVoter.active) {
    res.status(401).json({ message: 'Voter is not active' })
    return
  }

  if (!validVoter.loggedIn) {
    res.status(401).json({ message: 'Voter is not logged in' })
    return
  }

  const loggedOutVoter = await logout(voterId)
  res.status(200).json(loggedOutVoter)
}

const router = Router()

router.use('/login', (req, res, next) => {
  const { identifier } = req.body
  if (!validateVoterCode(identifier)) {
    res.status(400).json({ message: 'Invalid voter identifier' })
    return
  }
  next()
})

router.post('/login', handleLogin)

router.use('/logout', (req, res, next) => {
  const { voterId } = req.body
  if (!validateUuid(voterId)) {
    res.status(400).json({ message: 'Invalid voter ID' })
    return
  }
  next()
})

router.post('/logout', handleLogout)

export default router
