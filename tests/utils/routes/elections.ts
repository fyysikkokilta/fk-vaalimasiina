import { eq } from 'drizzle-orm'

import { db } from '~/db'
import { candidates, elections } from '~/db/schema'

export const createElection = async ({
  title,
  description,
  seats,
  status,
  votingMethod = 'STV',
  candidatesData
}: {
  title: string
  description: string
  seats: number
  status: 'CREATED' | 'UPDATING' | 'ONGOING' | 'FINISHED' | 'CLOSED'
  votingMethod?: 'STV' | 'MAJORITY'
  candidatesData: { name: string }[]
}) => {
  const election = await db.transaction(async (transaction) => {
    const insertedElections = await transaction
      .insert(elections)
      .values([
        {
          title,
          description,
          seats,
          status,
          votingMethod
        }
      ])
      .returning()

    const insertedCandidates = await transaction
      .insert(candidates)
      .values(
        candidatesData.map((candidate) => ({
          electionId: insertedElections[0].electionId,
          name: candidate.name
        }))
      )
      .returning()

    return { ...insertedElections[0], candidates: insertedCandidates }
  })

  return election
}

export const changeStatus = async (
  electionId: string,
  status: 'CREATED' | 'UPDATING' | 'ONGOING' | 'FINISHED' | 'CLOSED'
) => {
  const election = await db
    .update(elections)
    .set({
      status
    })
    .where(eq(elections.electionId, electionId))
    .returning()

  return election[0]
}
