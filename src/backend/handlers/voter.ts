import { Router, Request, Response } from 'express'
import { getVoterStatus } from '../routes/voter'
import { validateUuid } from '../validation/validation'

export const handleGetVoterStatus = async (req: Request, res: Response) => {
  const { voterId } = req.params
  try {
    const voter = await getVoterStatus(voterId)
    res.status(200).json(voter)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const router = Router()

router.use('/:voterId', (req, res, next) => {
  if (!validateUuid(req.params.voterId)) {
    res.status(400).json({ key: 'invalid_voter_id' })
    return
  }
  next()
})

router.get('/:voterId', handleGetVoterStatus)

export default router
