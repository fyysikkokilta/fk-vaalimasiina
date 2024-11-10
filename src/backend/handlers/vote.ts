import { Router, Response } from 'express'
import { addVote } from '../routes/vote'
import { getVoter } from '../routes/voter'
import { validateUuid } from '../validation/validation'
import { checkIsOnGoingElection, isValidBallot } from '../routes/elections'
import { RequestBody } from '../../../types/express'

type VoteRequestBody = {
  voterId: string
  ballot: { candidateId: string; preferenceNumber: number }[]
}
export const handleVote = async (
  req: RequestBody<VoteRequestBody>,
  res: Response
) => {
  const { voterId, ballot } = req.body

  const validVoter = await getVoter(voterId)

  if (!validVoter) {
    res.status(404).json({ key: 'voter_not_found' })
    return
  }

  const electionId = validVoter.electionId

  // Check if the election is ongoing
  if (!(await checkIsOnGoingElection(electionId))) {
    res.status(400).json({ key: 'election_not_ongoing' })
    return
  }

  if (validVoter.hasVoted) {
    res.status(403).json({ key: 'voter_already_voted' })
    return
  }

  // Validate that every candidate in the ballot is a valid candidate
  const validBallot = await isValidBallot(electionId, ballot)

  if (!validBallot) {
    res.status(400).json({ key: 'invalid_ballot' })
    return
  }

  const ballotId = await addVote(voterId, electionId, ballot)

  if (!ballotId) {
    res.status(500).json({ key: 'error_saving_ballot' })
    return
  }

  res.status(200).json(ballotId)
}

const router = Router()

router.use('/', (req: RequestBody<VoteRequestBody>, res, next) => {
  const { voterId } = req.body
  if (!validateUuid(voterId)) {
    res.status(400).json({ key: 'invalid_voter_id' })
    return
  }
  next()
})

router.use('/', (req: RequestBody<VoteRequestBody>, res, next) => {
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

router.post('/', handleVote)

export default router
