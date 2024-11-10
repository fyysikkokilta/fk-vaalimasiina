import { Router, Request, Response } from 'express'
import { getElections, getElection } from '../routes/elections'
import { validateUuid } from '../validation/validation'

export const handleFetchCurrentElection = async (
  _req: Request,
  res: Response
) => {
  try {
    const elections = await getElections()

    const allNonClosedElections = elections.filter(
      (election) => election.status !== 'CLOSED'
    )

    if (allNonClosedElections.length > 1) {
      res.status(500).json({ key: 'multiple_non_closed_elections' })
      return
    }

    const election = elections.find((election) => election.status !== 'CLOSED')
    const returnList = election ? [election] : []
    res.status(200).json(returnList)
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message })
    }
  }
}

export const handleFetchElection = async (req: Request, res: Response) => {
  const { electionId } = req.params
  try {
    const election = await getElection(electionId)
    if (!election) {
      res.status(404).json({ key: 'election_not_found' })
      return
    }
    res.status(200).json(election)
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message })
    }
  }
}

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

const router = Router()
router.get('/', handleFetchCurrentElection)
router.get('/completed', handleFetchCompletedElections)

router.use('/:electionId', (req, res, next) => {
  if (!validateUuid(req.params.electionId)) {
    res.status(400).json({ key: 'invalid_election_id' })
    return
  }
  next()
})

router.get('/:electionId', handleFetchElection)

export default router
