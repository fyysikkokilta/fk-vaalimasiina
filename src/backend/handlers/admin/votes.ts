import { Router, Request, Response } from 'express'
import { getVoteCount } from '../../routes/admin/votes'
import { validateUuid } from '../../validation/validation'
import { getVotes } from '../../routes/votes'

export const handleFetchVotesForElection = async (
  req: Request,
  res: Response
) => {
  const { electionId } = req.params
  try {
    const votes = await getVotes(electionId)
    res.status(200).json(votes)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const handleGetVoteCount = async (req: Request, res: Response) => {
  const { electionId } = req.params
  try {
    const voteCount = await getVoteCount(electionId)
    res.status(200).json(voteCount)
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

router.get('/:electionId/count', handleGetVoteCount)
router.get('/:electionId', handleFetchVotesForElection)

export default router