import { Request, Response, Router } from 'express'

import { getVotes } from '../../routes/admin/votes'
import { validateUuid } from '../../validation/validation'

export const handleFetchVotesForElection = async (
  req: Request,
  res: Response
) => {
  const { electionId } = req.params
  try {
    const votes = await getVotes(electionId)
    res.status(200).json(votes)
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message })
    }
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

router.get('/:electionId', handleFetchVotesForElection)

export default router
