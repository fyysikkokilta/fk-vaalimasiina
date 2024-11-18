import { Response, Router } from 'express'

import { RequestBody } from '../../../types/express'
import { Election, VoteData } from '../../../types/types'
import { getVoterWithElection } from '../routes/voters'
import { addVote } from '../routes/votes'
import { validateUuid } from '../validation/validation'

export const isValidBallot = (
  ballot: VoteData['ballot'],
  election: Election
) => {
  // Check that every candidate in the ballot is a valid candidate
  const validBallot = ballot.every((ballotItem) =>
    election.candidates.some(
      (candidate) =>
        candidate.candidateId === ballotItem.candidateId &&
        candidate.electionId === election.electionId
    )
  )

  // Validate preference numbers
  const preferenceNumbers = ballot.map((b) => b.preferenceNumber)
  const validPreferenceNumbers = preferenceNumbers.every(
    (preferenceNumber) =>
      preferenceNumber > 0 && preferenceNumber <= election.candidates.length
  )

  return validBallot && validPreferenceNumbers
}

type VoteRequestBody = {
  voterId: string
  ballot: { candidateId: string; preferenceNumber: number }[]
}
export const handleVote = async (
  req: RequestBody<VoteRequestBody>,
  res: Response
) => {
  const { voterId, ballot } = req.body

  const validVoter = await getVoterWithElection(voterId)

  if (!validVoter) {
    res.status(404).json({ key: 'voter_not_found' })
    return
  }

  const election = validVoter.election
  const electionIsOnGoing = election.status === 'ONGOING'

  // Check if the election is ongoing
  if (!election || !electionIsOnGoing) {
    res.status(400).json({ key: 'election_not_ongoing' })
    return
  }

  if (validVoter.hasVoted) {
    res.status(403).json({ key: 'voter_already_voted' })
    return
  }

  // Validate that every candidate in the ballot is a valid candidate
  const validBallot = isValidBallot(ballot, election)

  if (!validBallot) {
    res.status(400).json({ key: 'invalid_ballot' })
    return
  }

  const ballotId = await addVote(voterId, election.electionId, ballot)

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
