import { Router, Request, Response } from 'express'
import { addVote, checkIfAlreadyVoted } from '../routes/vote'
import { getVoterStatus } from '../routes/voter'
import { validateUuid } from '../validation/validation'

export const handleVote = async (req: Request, res: Response) => {
  const { electionId } = req.params
  const { voterId, votes } = req.body

  const validVoter = await getVoterStatus(voterId)

  if (!validVoter) {
    res.status(404).json({ message: 'Voter not found' })
    return
  }

  if (!validVoter.active) {
    res.status(401).json({ message: 'Voter is not active' })
    return
  }

  if (!validVoter.loggedIn) {
    res.status(401).json({ message: 'Voter is not logged in' })
    return
  }

  // Check if the voter has already voted
  const alreadyVoted = await checkIfAlreadyVoted(voterId, electionId)

  if (alreadyVoted) {
    res.status(403).json({ message: 'Already voted' })
    return
  }

  // Validate vote
  // TODO: Better validation
  votes.forEach((v: string) => {
    if (typeof v !== 'string') {
      res.status(400).json({ message: 'Invalid vote' })
      return
    }
  })

  const savedVote = await addVote(voterId, electionId, votes)
  const voteData = savedVote.get({ plain: true })

  res.status(200).json(voteData.candidateIds)
}

export const handleCheckIfAlreadyVoted = async (
  req: Request,
  res: Response
) => {
  const { electionId } = req.params
  const { voterId } = req.body

  const validVoter = await getVoterStatus(voterId)

  if (!validVoter) {
    res.status(404).json({ message: 'Voter not found' })
    return
  }

  if (!validVoter.active) {
    res.status(401).json({ message: 'Voter is not active' })
    return
  }

  if (!validVoter.loggedIn) {
    res.status(401).json({ message: 'Voter is not logged in' })
    return
  }

  const alreadyVoted = await checkIfAlreadyVoted(voterId, electionId)

  res.status(200).json(alreadyVoted)
}

const router = Router()

router.use('/:electionId', (req, res, next) => {
  if (!validateUuid(req.params.electionId)) {
    res.status(400).json({ message: 'Invalid election ID' })
    return
  }
  next()
})

router.post('/:electionId/check', handleCheckIfAlreadyVoted)

router.use('/:electionId', (req, res, next) => {
  const { voterId } = req.body
  if (!validateUuid(voterId)) {
    res.status(400).json({ message: 'Invalid voter ID' })
    return
  }
  next()
})

router.use('/:electionId', (req, res, next) => {
  const { votes } = req.body
  if (!Array.isArray(votes)) {
    res.status(400).json({ message: 'Invalid votes' })
    return
  }
  votes.forEach((v: string) => {
    if (!validateUuid(v)) {
      res.status(400).json({ message: 'Invalid vote' })
      return
    }
  })
  next()
})

router.post('/:electionId', handleVote)

export default router
