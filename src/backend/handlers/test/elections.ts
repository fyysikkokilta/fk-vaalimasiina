import { Request, Response, Router } from 'express'
import {
  changeTestElectionStatus,
  createTestElection,
} from '../../routes/test/elections'

export const handleCreateTestElection = async (req: Request, res: Response) => {
  const { title, description, amountToElect, candidates, status } = req.body
  const election = createTestElection(
    title,
    description,
    amountToElect,
    candidates,
    status
  )

  res.status(201).json(election)
}

export const handleChangeTestElectionStatus = async (
  req: Request,
  res: Response
) => {
  const { electionId } = req.params
  const { status } = req.body
  const election = changeTestElectionStatus(electionId, status)

  res.status(200).json(election)
}

const router = Router()

router.post('/', handleCreateTestElection)
router.put('/:electionId', handleChangeTestElectionStatus)

export default router
