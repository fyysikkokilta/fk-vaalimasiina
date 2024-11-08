import { Request, Response, Router } from 'express'
import { changeVoterEmail, getVoters } from '../../routes/admin/voters'
import { validateUuid } from '../../validation/validation'

export const handleChangeVoterEmail = async (req: Request, res: Response) => {
  const { voterId } = req.params
  const { email } = req.body
  try {
    const voter = await changeVoterEmail(voterId, email)
    res.status(200).json(voter)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const handleGetVoters = async (req: Request, res: Response) => {
  const { electionId } = req.params
  try {
    const voters = await getVoters(electionId)
    res.status(200).json(voters)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const router = Router()

router.use('/:electionId', (req, res, next) => {
  if (!validateUuid(req.params.electionId)) {
    res.status(400).json({ key: 'invalid_election_id' })
    return
  }
  next()
})

router.get('/:electionId', handleGetVoters)

router.use('/:voterId', (req, res, next) => {
  if (!validateUuid(req.params.voterId)) {
    res.status(400).json({ key: 'invalid_voter_id' })
    return
  }
  if (!req.body.email) {
    res.status(400).json({ key: 'missing_email' })
    return
  }
  next()
})

router.put('/:voterId', handleChangeVoterEmail)

export default router
