import { db } from '../db'
import { ballotsTable, votesTable, votersTable } from '../db/schema'
import { isNoElectionOngoing } from './elections'
import { VoteData } from '../../../types/types'
import { eq } from 'drizzle-orm'

export const addVote = async (
  voterId: string,
  electionId: string,
  ballot: VoteData['ballot']
) => {
  if (await isNoElectionOngoing(electionId)) {
    return null
  }

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
