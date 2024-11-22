import { Request, Response, Router } from 'express'

import { getCompletedElectionWithVotes } from '../../routes/elections'
import { validateUuid } from '../../validation/validation'

export const handleFetchVotesForElection = async (
  req: Request,
  res: Response
) => {
  const { electionId } = req.params
  try {
    const election = await getCompletedElectionWithVotes(electionId)
    if (!election) {
      res.status(404).json({ key: 'election_not_found' })
      return
    }

    if (election.status !== 'FINISHED' && election.status !== 'CLOSED') {
      res.status(400).json({ key: 'election_not_completed' })
      return
    }
    res.status(200).json(election.ballots)
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
