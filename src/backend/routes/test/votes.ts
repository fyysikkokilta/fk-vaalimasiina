import Ballot from '../../models/ballot'
import Voter from '../../models/voter'
import Op from 'sequelize/lib/operators'
import Vote from '../../models/vote'
import { CreationAttributes } from 'sequelize'

export const createTestVotes = async (
  electionId: string,
  voterIdBallotPairs: {
    voterId: string
    ballot: { candidateId: string; preferenceNumber: number }[]
  }[]
) => {
  const ballots = await Ballot.bulkCreate(
    voterIdBallotPairs.map(
      (pair) =>
        ({
          electionId,
          votes: pair.ballot.map((vote) => ({
            candidateId: vote.candidateId,
            preferenceNumber: vote.preferenceNumber,
          })),
        }) as CreationAttributes<Ballot>
    ),
    {
      returning: true,
      include: [
        {
          model: Vote,
          as: 'votes',
        },
      ],
    }
  )

  await Voter.update(
    { hasVoted: true },
    {
      where: {
        voterId: { [Op.in]: voterIdBallotPairs.map((e) => e.voterId) },
      },
    }
  )

  return ballots.map((ballot) => ballot.get({ plain: true }))
}
