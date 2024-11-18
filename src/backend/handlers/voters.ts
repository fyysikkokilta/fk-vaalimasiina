import { Request, Response, Router } from 'express'

import { getVoterWithElection } from '../routes/voters'
import { validateUuid } from '../validation/validation'

export const handleGetVoterWithElection = async (
  req: Request,
  res: Response
) => {
  const { voterId } = req.params
  try {
    const voter = await getVoterWithElection(voterId)
    if (!voter) {
      res.status(404).json({ key: 'voter_not_found' })
      return
    }
    const { election, ...voterWithoutElections } = voter
    res.status(200).json({ voter: voterWithoutElections, election })
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message })
    }
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

router.get('/:voterId', handleGetVoterWithElection)

export default router
