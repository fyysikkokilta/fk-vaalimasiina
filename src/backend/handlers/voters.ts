import { Router, Request, Response } from 'express'
import { validateUuid } from '../validation/validation'
import { getVoter } from '../routes/voter'

export const handleGetVoter = async (req: Request, res: Response) => {
  const { voterId } = req.params
  try {
    const voter = await getVoter(voterId)
    if (!voter) {
      res.status(404).json({ key: 'voter_not_found' })
      return
    }
    res.status(200).json(voter)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const router = Router()

router.use('/:voterId', (req, res, next) => {
  if (!validateUuid(req.params.voterId)) {
    res.status(400).json({ key: 'invalid_voter_id' })
    return
  }
  next()
})

router.get('/:voterId', handleGetVoter)

export default router
