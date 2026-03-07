import { db } from '~/db'
import { ballots, hasVoted, votes } from '~/db/schema'

export const createVotes = async (
  electionId: string,
  voterIdBallotPairs: {
    voterId: string
    ballot: { candidateId: string; rank: number }[]
  }[]
) => {
  return db.transaction(async (transaction) => {
    const insertedBallots = await transaction
      .insert(ballots)
      .values(
        voterIdBallotPairs.map(() => ({
          electionId
        }))
      )
      .returning()

    const insertedVotes = await transaction
      .insert(votes)
      .values(
        insertedBallots
          .map((ballot, index) =>
            voterIdBallotPairs[index].ballot.map((vote) => ({
              ballotId: ballot.ballotId,
              candidateId: vote.candidateId,
              rank: vote.rank
            }))
          )
          .flat()
      )
      .returning()

    await transaction.insert(hasVoted).values(
      voterIdBallotPairs.map(({ voterId }) => ({
        voterId
      }))
    )

    return insertedBallots.map((ballot) => ({
      ...ballot,
      votes: insertedVotes.filter((vote) => vote.ballotId === ballot.ballotId)
    }))
  })
}
