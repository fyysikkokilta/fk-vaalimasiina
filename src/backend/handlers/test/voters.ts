import { Response, Router } from 'express'

import { RequestBody } from '../../../../types/express'
import { createTestVoters } from '../../routes/test/voters'

export type CreateTestVotersRequestBody = {
  electionId: string
  emails: string[]
}
export const handleCreateTestVoters = async (
  req: RequestBody<CreateTestVotersRequestBody>,
  res: Response
) => {
  const { electionId, emails } = req.body

  try {
    const voters = await createTestVoters(electionId, emails)
    res.status(201).json(voters)
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message })
    }
  }
}

const router = Router()

router.post('/', handleCreateTestVoters)

export default router
