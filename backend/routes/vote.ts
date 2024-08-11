import Vote from '../models/vote'
import { isNoElectionOngoing } from './elections'
import { HasVoted } from '../models/hasVoted'
import { randomUUID } from 'crypto'
import { VoteData } from '../../types/types'

export const addVote = async (
  voterId: string,
  electionId: string,
  ballot: VoteData['ballot']
) => {
  if (await isNoElectionOngoing(electionId)) {
    return null
  }

  const transaction = await Vote.sequelize!.transaction()

  try {
    const ballotId = randomUUID() // Generate a random ballot ID for the vote
    const vote = await Vote.bulkCreate(
      ballot.map((b) => ({
        ballotId,
        electionId,
        candidateId: b.candidateId,
        preferenceNumber: b.preferenceNumber,
      })),
      { transaction }
    )

    await HasVoted.create(
      {
        electionId,
        voterId,
      },
      { transaction }
    )

    await transaction.commit()

    return vote
  } catch (error) {
    await transaction.rollback()
    return null
  }
}

export const checkIfAlreadyVoted = async (
  voterId: string,
  electionId: string
) => {
  if (await isNoElectionOngoing(electionId)) {
    return null
  }

  const vote = await HasVoted.findOne({
    where: { voterId, electionId },
  })

  return !!vote
}
