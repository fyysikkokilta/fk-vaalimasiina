import { Request, Response, Router } from 'express'
import { createTestVote } from '../../routes/test/vote'

export const handleTestVote = async (req: Request, res: Response) => {
  const { voterId, electionId, ballot } = req.body
  try {
    const vote = await createTestVote(voterId, electionId, ballot)
    res.status(201).json(vote)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const router = Router()

router.post('/', handleTestVote)

export default router