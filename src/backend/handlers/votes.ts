import { Request, Response, Router } from 'express'
import { validateUuid } from '../validation/validation'
import { getVotes } from '../routes/votes'
import { checkIsCompletedElection } from '../routes/elections'

export const handleGetVotesForCompletedElection = async (
  req: Request,
  res: Response
) => {
  const { electionId } = req.params
  try {
    const isCompleted = checkIsCompletedElection(electionId)
    if (!isCompleted) {
      res.status(400).json({ message: 'Election is not completed' })
      return
    }
    const votes = await getVotes(electionId)
    res.status(200).json(votes)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const router = Router()

router.use('/:electionId', (req, res, next) => {
  if (!validateUuid(req.params.electionId)) {
    res.status(400).json({ message: 'Invalid election ID' })
    return
  }
  next()
})

router.get('/:electionId', handleGetVotesForCompletedElection)

export default router
