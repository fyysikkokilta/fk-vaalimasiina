import Vote from '../models/vote'
import Voter from '../models/voter'
import { isNoElectionOngoing } from './elections'
import { VoteData } from '../../../types/types'

export const addVote = async (
  voterId: string,
  electionId: string,
  ballotId: string,
  ballot: VoteData['ballot']
) => {
  if (await isNoElectionOngoing(electionId)) {
    return null
  }

  const transaction = await Vote.sequelize!.transaction()

  try {
    const vote = await Vote.bulkCreate(
      ballot.map((b) => ({
        ballotId,
        electionId,
        candidateId: b.candidateId,
        preferenceNumber: b.preferenceNumber,
      })),
      { transaction }
    )

    await Voter.update(
      { hasVoted: true },
      { where: { voterId, electionId }, transaction }
    )

    await transaction.commit()

    return vote
  } catch (error) {
    await transaction.rollback()
    return null
  }
}
