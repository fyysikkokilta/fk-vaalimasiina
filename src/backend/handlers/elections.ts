import { Request, Response, Router } from 'express'

import {
  findFinishedElectionWithVotes,
  getCompletedElectionWithVotes,
  getElections
} from '../routes/elections'
import { validateUuid } from '../validation/validation'

export const handleFetchCompletedElections = async (
  _req: Request,
  res: Response
) => {
  try {
    const elections = await getElections()
    const completedElections = elections.filter(
      (election) => election.status === 'CLOSED'
    )
    res.status(200).json(completedElections)
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message })
    }
  }
}

export const handleFindFinishedElectionWithVotes = async (
  _req: Request,
  res: Response
) => {
  try {
    const election = await findFinishedElectionWithVotes()
    if (!election) {
      res.status(200).json({ election: null, ballots: [] })
      return
    }
    const { ballots, ...electionWithoutVotes } = election
    res.status(200).json({ election: electionWithoutVotes, ballots })
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message })
    }
  }
}

export const handleFetchCompletedElectionWithVotes = async (
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
    const { ballots, voterCount, ...electionWithoutVotes } = election
    res
      .status(200)
      .json({ election: electionWithoutVotes, ballots, voterCount })
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message })
    }
  }
}

const router = Router()

router.get('/', handleFetchCompletedElections)
router.get('/finished', handleFindFinishedElectionWithVotes)

router.use('/:electionId', (req, res, next) => {
  if (!validateUuid(req.params.electionId)) {
    res.status(400).json({ key: 'invalid_election_id' })
    return
  }
  next()
})

router.get('/:electionId', handleFetchCompletedElectionWithVotes)

export default router
