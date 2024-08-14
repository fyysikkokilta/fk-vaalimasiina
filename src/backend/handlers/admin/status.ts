import { Router, Request, Response } from 'express'
import { getElections } from '../../routes/elections'

export const handleFetchtatus = async (req: Request, res: Response) => {
  // Return NEW if no elections in state 'CREATED'
  // Return PREVIEW if one in state 'CREATED'
  // Return VOTING if one in state 'ONGOING'
  // Return RESULTS if one in state 'FINISHED'
  // Return ERROR if any other state

  // Get all elections
  const elections = await getElections()

  // Filter elections by state
  const createdElections = elections.filter(
    (election) => election.status === 'CREATED'
  )
  const ongoingElections = elections.filter(
    (election) => election.status === 'ONGOING'
  )
  const finishedElections = elections.filter(
    (election) => election.status === 'FINISHED'
  )

  // Return status
  if (createdElections.length === 1) {
    res.status(200).json({ status: 'PREVIEW' })
  } else if (ongoingElections.length === 1) {
    res.status(200).json({ status: 'VOTING' })
  } else if (finishedElections.length === 1) {
    res.status(200).json({ status: 'RESULTS' })
  } else if (createdElections.length === 0) {
    res.status(200).json({ status: 'NEW' })
  } else {
    res.status(500).json({ status: 'ERROR' })
  }
}

const router = Router()
router.get('/', handleFetchtatus)

export default router
