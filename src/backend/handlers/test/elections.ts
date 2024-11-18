import { Response, Router } from 'express'

import { RequestBody, RequestBodyParams } from '../../../../types/express'
import {
  changeTestElectionStatus,
  createTestElection
} from '../../routes/test/elections'

export type CreateTestElectionRequestBody = {
  title: string
  description: string
  seats: number
  candidates: { name: string }[]
  status: 'CREATED' | 'ONGOING' | 'FINISHED' | 'CLOSED'
}
export const handleCreateTestElection = async (
  req: RequestBody<CreateTestElectionRequestBody>,
  res: Response
) => {
  const { title, description, seats, candidates, status } = req.body
  const election = await createTestElection(
    title,
    description,
    seats,
    candidates,
    status
  )

  res.status(201).json(election)
}

export type ChangeTestElectionStatusRequestBody = {
  status: 'CREATED' | 'ONGOING' | 'FINISHED' | 'CLOSED'
}
export type ChangeTestElectionStatusRequestParams = {
  electionId: string
}
export const handleChangeTestElectionStatus = async (
  req: RequestBodyParams<
    ChangeTestElectionStatusRequestBody,
    ChangeTestElectionStatusRequestParams
  >,
  res: Response
) => {
  const { electionId } = req.params
  const { status } = req.body
  const election = await changeTestElectionStatus(electionId, status)

  res.status(200).json(election)
}

const router = Router()

router.post('/', handleCreateTestElection)
router.put('/:electionId', handleChangeTestElectionStatus)

export default router
