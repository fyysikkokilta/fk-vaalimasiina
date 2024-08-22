import { randomUUID } from 'crypto'
import Vote from '../../models/vote'
import { HasVoted } from '../../models/hasVoted'

export const createTestVote = async (
  voterId: string,
  electionId: string,
  ballot: { candidateId: string; preferenceNumber: number }[]
) => {
  const ballotId = randomUUID()
  const votes = await Vote.bulkCreate(
    ballot.map((vote) => ({
      ballotId,
      candidateId: vote.candidateId,
      preferenceNumber: vote.preferenceNumber,
      electionId,
    })),
    { returning: true }
  )

  await HasVoted.create({
    voterId,
    electionId,
  })

  return votes.map((vote) => vote.get({ plain: true }))
}
