import { randomUUID } from 'crypto'
import Vote from '../../models/vote'
import Voter from '../../models/voter'
import Op from 'sequelize/lib/operators'

export const createTestVotes = async (
  electionId: string,
  voterIdBallotPairs: {
    voterId: string
    ballot: { candidateId: string; preferenceNumber: number }[]
  }[]
) => {
  const votes = await Vote.bulkCreate(
    voterIdBallotPairs
      .map(({ ballot }) => {
        const ballotId = randomUUID()
        return ballot.map((vote) => ({
          ballotId,
          candidateId: vote.candidateId,
          preferenceNumber: vote.preferenceNumber,
          electionId,
        }))
      })
      .flat(),
    { returning: true }
  )

  await Voter.update(
    { hasVoted: true },
    {
      where: {
        voterId: { [Op.in]: voterIdBallotPairs.map((e) => e.voterId) },
      },
    }
  )

  return votes.map((vote) => vote.get({ plain: true }))
}
