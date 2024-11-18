import { eq } from 'drizzle-orm'

import { VoteData } from '../../../types/types'
import { db } from '../db'
import { ballotsTable, votersTable, votesTable } from '../db/schema'

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

    await transaction
      .update(votersTable)
      .set({ hasVoted: true })
      .where(eq(votersTable.voterId, voterId))

    return ballots[0].ballotId
  })
}
