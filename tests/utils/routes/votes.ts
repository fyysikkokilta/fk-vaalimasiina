import { getDb } from '~/db'
import { ballotsTable, hasVotedTable, votesTable } from '~/db/schema'

export const createVotes = async (
  electionId: string,
  voterIdBallotPairs: {
    voterId: string
    ballot: { candidateId: string; rank: number }[]
  }[]
) => {
  return getDb().transaction(async (transaction) => {
    const ballots = await transaction
      .insert(ballotsTable)
      .values(
        voterIdBallotPairs.map(() => ({
          electionId
        }))
      )
      .returning()

    const votes = await transaction
      .insert(votesTable)
      .values(
        ballots
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

    await transaction.insert(hasVotedTable).values(
      voterIdBallotPairs.map(({ voterId }) => ({
        voterId
      }))
    )

    return ballots.map((ballot) => ({
      ...ballot,
      votes: votes.filter((vote) => vote.ballotId === ballot.ballotId)
    }))
  })
}
