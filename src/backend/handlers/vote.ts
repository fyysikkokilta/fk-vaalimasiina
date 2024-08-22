import { Router, Request, Response } from 'express'
import { addVote, checkIfAlreadyVoted } from '../routes/vote'
import { getVoterStatus } from '../routes/voter'
import { validateUuid } from '../validation/validation'
import { isValidBallot } from '../routes/elections'

export const handleVote = async (req: Request, res: Response) => {
  const { electionId } = req.params
  const { voterId, ballot } = req.body

  const validVoter = await getVoterStatus(voterId)

  if (!validVoter) {
    res.status(404).json({ key: 'voter_not_found' })
    return
  }

  if (!validVoter.active) {
    res.status(401).json({ key: 'voter_not_active' })
    return
  }

  if (!validVoter.loggedIn) {
    res.status(401).json({ key: 'voter_not_logged_in' })
    return
  }

  // Check if the voter has already voted
  const alreadyVoted = await checkIfAlreadyVoted(voterId, electionId)

  if (alreadyVoted) {
    res.status(403).json({ key: 'voter_already_voted' })
    return
  }

  // Validate that every candidate in the ballot is a valid candidate
  const validBallot = await isValidBallot(electionId, ballot)

  if (!validBallot) {
    res.status(400).json({ key: 'invalid_ballot' })
    return
  }

  const savedVote = await addVote(voterId, electionId, ballot)

  if (!savedVote) {
    res.status(500).json({ key: 'error_saving_vote' })
    return
  }

  const votesData = savedVote.map((v) => v.get({ plain: true }))

  //TODO: Could verify that the votes are correct and preferences are correct
  const savedCandidateIds = votesData.map((v) => v.candidateId)

  res.status(200).json(savedCandidateIds)
}

export const handleCheckIfAlreadyVoted = async (
  req: Request,
  res: Response
) => {
  const { electionId } = req.params
  const { voterId } = req.body

  const validVoter = await getVoterStatus(voterId)

  if (!validVoter) {
    res.status(404).json({ key: 'voter_not_found' })
    return
  }

  if (!validVoter.active) {
    res.status(401).json({ key: 'voter_not_active' })
    return
  }

  if (!validVoter.loggedIn) {
    res.status(401).json({ key: 'voter_not_logged_in' })
    return
  }

  const alreadyVoted = await checkIfAlreadyVoted(voterId, electionId)

  res.status(200).json(alreadyVoted)
}

const router = Router()

router.use('/:electionId', (req, res, next) => {
  if (!validateUuid(req.params.electionId)) {
    res.status(400).json({ key: 'invalid_election_id' })
    return
  }
  next()
})

router.post('/:electionId/check', handleCheckIfAlreadyVoted)

router.use('/:electionId', (req, res, next) => {
  const { voterId } = req.body
  if (!validateUuid(voterId)) {
    res.status(400).json({ key: 'invalid_voter_id' })
    return
  }
  next()
})

router.use('/:electionId', (req, res, next) => {
  const { ballot } = req.body
  if (!Array.isArray(ballot)) {
    res.status(400).json({ key: 'invalid_ballot' })
    return
  }

  ballot.forEach((vote) => {
    if (!validateUuid(vote.candidateId)) {
      res.status(400).json({ key: 'invalid_candidate_id' })
      return
    }
    if (
      typeof vote.preferenceNumber !== 'number' ||
      vote.preferenceNumber < 1 ||
      vote.preferenceNumber > ballot.length
    ) {
      res.status(400).json({ key: 'invalid_preference_number' })
      return
    }
  })
  next()
})

router.post('/:electionId', handleVote)

export default router
