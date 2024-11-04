import { Request, Response, Router } from 'express'
import { createTestVotes } from '../../routes/test/votes'

export const handleCreateTestVotes = async (req: Request, res: Response) => {
  const { electionId, voterIdBallotPairs } = req.body
  try {
    const votes = await createTestVotes(electionId, voterIdBallotPairs)
    res.status(201).json(votes)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const router = Router()

router.post('/', handleCreateTestVotes)

export default router
