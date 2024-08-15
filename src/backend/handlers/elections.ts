import { Router, Request, Response } from 'express'
import { getElections, getElectionById } from '../routes/elections'
import { validateUuid } from '../validation/validation'

export const handleFetchCurrentElection = async (
  req: Request,
  res: Response
) => {
  try {
    const elections = await getElections()

    const allNonClosedElections = elections.filter(
      (election) => election.status !== 'CLOSED'
    )

    if (allNonClosedElections.length > 1) {
      res.status(500).json({ message: 'Multiple non-closed elections' })
      return
    }

    const election = elections.find((election) => election.status !== 'CLOSED')
    const returnList = election ? [election] : []
    res.status(200).json(returnList)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const handleFetchElectionById = async (req: Request, res: Response) => {
  const { electionId } = req.params
  try {
    const election = await getElectionById(electionId)
    if (!election) {
      res.status(404).json({ message: 'Election not found' })
      return
    }
    res.status(200).json(election)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const handleFetchCompletedElections = async (
  req: Request,
  res: Response
) => {
  try {
    const elections = await getElections()
    const completedElections = elections.filter(
      (election) => election.status === 'CLOSED'
    )
    res.status(200).json(completedElections)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const router = Router()
router.get('/', handleFetchCurrentElection)
router.get('/completed', handleFetchCompletedElections)

router.use('/:electionId', (req, res, next) => {
  if (!validateUuid(req.params.electionId)) {
    res.status(400).json({ message: 'Invalid election ID' })
    return
  }
  next()
})

router.get('/:electionId', handleFetchElectionById)

export default router
