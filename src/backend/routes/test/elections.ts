import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { candidatesTable, electionsTable } from '../../db/schema'

export const createTestElection = async (
  title: string,
  description: string,
  seats: number,
  candidatesData: { name: string }[],
  status: 'CREATED' | 'ONGOING' | 'FINISHED' | 'CLOSED'
) => {
  return db.transaction(async (transaction) => {
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

    const candidates = await transaction
      .insert(candidatesTable)
      .values(
        candidatesData.map((candidate) => ({
          electionId: elections[0].electionId,
          name: candidate.name
        }))
      )
      .returning()

    return { ...elections[0], candidates }
  })
}

export const changeTestElectionStatus = async (
  electionId: string,
  status: 'CREATED' | 'ONGOING' | 'FINISHED' | 'CLOSED'
) => {
  const elections = await db
    .update(electionsTable)
    .set({
      status
    })
    .where(eq(electionsTable.electionId, electionId))
    .returning()

  if (!elections[0]) {
    return null
  }

  return elections[0] || null
}
