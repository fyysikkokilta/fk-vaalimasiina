import Ballot from '../models/ballot'
import Voter from '../models/voter'
import { isNoElectionOngoing } from './elections'
import { VoteData } from '../../../types/types'
import Vote from '../models/vote'
import { CreationAttributes } from 'sequelize'

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
    const savedBallot = await Ballot.create(
      {
        electionId,
        votes: ballot.map((vote) => ({
          candidateId: vote.candidateId,
          preferenceNumber: vote.preferenceNumber
        }))
      } as CreationAttributes<Ballot>,
      {
        transaction,
        include: {
          model: Vote,
          as: 'votes'
        }
      }
    )

    await Voter.update(
      { hasVoted: true },
      { where: { voterId, electionId }, transaction }
    )

    await transaction.commit()

    return savedBallot.get({ plain: true })
  } catch (error) {
    await transaction.rollback()
    return null
  }
}
