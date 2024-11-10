import { Request, Response, Router } from 'express'
import { validateUuid } from '../validation/validation'
import { findCompletedElectionWithVotes } from '../routes/elections'

export const handleGetVotesForCompletedElection = async (
  req: Request,
  res: Response
) => {
  const { electionId } = req.params
  try {
    const election = await findCompletedElectionWithVotes(electionId)
    if (!election) {
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

router.get('/:electionId', handleGetVotesForCompletedElection)

export default router
