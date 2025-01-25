import { VoteData } from '../../../types/types'
import { db } from '../db'
import { ballotsTable, hasVotedTable, votesTable } from '../db/schema'

export const addVote = async (
  voterId: string,
  electionId: string,
  ballot: VoteData['ballot']
) => {
  return db.transaction(async (transaction) => {
    const ballots = await transaction
      .insert(ballotsTable)
      .values({ electionId })
      .returning({ ballotId: ballotsTable.ballotId })

    if (ballot.length > 0) {
      await transaction.insert(votesTable).values(
        ballot.map((vote) => ({
          ballotId: ballots[0].ballotId,
          candidateId: vote.candidateId,
          preferenceNumber: vote.preferenceNumber
        }))
      )
    }

    // Don't allow the same voter to vote twice
    // Duplicate votes are handled by the database schema
    // If duplicate votes are attempted, the database will throw an error
    await transaction.insert(hasVotedTable).values({ voterId })

    return ballots[0].ballotId
  })
}
