import { eq } from 'drizzle-orm'

import { db } from '~/db'
import { candidatesTable, electionsTable } from '~/db/schema'

export const createElection = async ({
  title,
  description,
  seats,
  status,
  candidates
}: {
  title: string
  description: string
  seats: number
  status: 'CREATED' | 'UPDATING' | 'ONGOING' | 'FINISHED' | 'CLOSED'
  candidates: { name: string }[]
}) => {
  const election = await db.transaction(async (transaction) => {
    const elections = await transaction
      .insert(electionsTable)
      .values([
        {
          title,
          description,
          seats,
          status
        }
      ])
      .returning()

    const insertedCandidates = await transaction
      .insert(candidatesTable)
      .values(
        candidates.map((candidate) => ({
          electionId: elections[0].electionId,
          name: candidate.name
        }))
      )
      .returning()

    return { ...elections[0], candidates: insertedCandidates }
  })

  return election
}

export const changeStatus = async (
  electionId: string,
  status: 'CREATED' | 'UPDATING' | 'ONGOING' | 'FINISHED' | 'CLOSED'
) => {
  const election = await db
    .update(electionsTable)
    .set({
      status
    })
    .where(eq(electionsTable.electionId, electionId))
    .returning()

  return election[0]
}
