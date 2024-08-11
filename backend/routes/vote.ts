import Vote from '../models/vote'
import { isNoElectionOngoing } from './elections'
import { HasVoted } from '../models/hasVoted'

export const addVote = async (
  voterId: string,
  electionId: string,
  candidateIds: string[]
) => {
  if (await isNoElectionOngoing(electionId)) {
    return null
  }

  const transaction = await Vote.sequelize!.transaction()

  try {
    const vote = await Vote.create(
      {
        electionId,
        candidateIds,
      },
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
