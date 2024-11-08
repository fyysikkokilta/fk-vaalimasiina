import { inArray } from 'drizzle-orm'
import { db } from '../../db'
import { ballotsTable, votersTable, votesTable } from '../../db/schema'

export const createTestVotes = async (
  electionId: string,
  voterIdBallotPairs: {
    voterId: string
    ballot: { candidateId: string; preferenceNumber: number }[]
  }[]
) => {
  return db.transaction(async (transaction) => {
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
              preferenceNumber: vote.preferenceNumber
            }))
          )
          .flat()
      )
      .returning()

    await transaction
      .update(votersTable)
      .set({ hasVoted: true })
      .where(
        inArray(
          votersTable.voterId,
          voterIdBallotPairs.map((pair) => pair.voterId)
        )
      )

    return ballots.map((ballot) => ({
      ...ballot,
      votes: votes.filter((vote) => vote.ballotId === ballot.ballotId)
    }))
  })
}
