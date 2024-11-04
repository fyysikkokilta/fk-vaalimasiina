import { Request, Response, Router } from 'express'
import { createTestVoters } from '../../routes/test/voters'

export const handleCreateTestVoters = async (req: Request, res: Response) => {
  const { electionId, emails } = req.body

  try {
    const voters = await createTestVoters(electionId, emails)
    res.status(201).json(voters)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const router = Router()

router.post('/', handleCreateTestVoters)

export default router
