import { Router, Request, Response } from 'express'
import { validateUuid } from '../validation/validation'
import { getVoterByVotingId } from '../routes/voter'

export const handleGetVoter = async (req: Request, res: Response) => {
  const { votingId } = req.params
  try {
    const voter = await getVoterByVotingId(votingId)
    if (!voter) {
      res.status(404).json({ key: 'voter_not_found' })
      return
    }
    res.status(200).json(voter)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const router = Router()

router.use('/:votingId', (req, res, next) => {
  if (!validateUuid(req.params.votingId)) {
    res.status(400).json({ key: 'invalid_voting_id' })
    return
  }
  next()
})

router.get('/:votingId', handleGetVoter)

export default router
