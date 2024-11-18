import { Response, Router } from 'express'

import { RequestBody } from '../../../../types/express'
import { createTestVotes } from '../../routes/test/votes'

export type CreateTestVotesRequestBody = {
  electionId: string
  voterIdBallotPairs: {
    voterId: string
    ballot: { candidateId: string; preferenceNumber: number }[]
  }[]
}
export const handleCreateTestVotes = async (
  req: RequestBody<CreateTestVotesRequestBody>,
  res: Response
) => {
  const { electionId, voterIdBallotPairs } = req.body
  try {
    const votes = await createTestVotes(electionId, voterIdBallotPairs)
    res.status(201).json(votes)
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message })
    }
  }
}

const router = Router()

router.post('/', handleCreateTestVotes)

export default router
