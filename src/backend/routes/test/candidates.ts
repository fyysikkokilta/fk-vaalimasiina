import { db } from '../../db'
import { candidatesTable } from '../../db/schema'

export const createTestCandidates = async (
  electionId: string,
  candidates: { name: string }[]
) => {
  return db
    .insert(candidatesTable)
    .values(
      candidates.map((candidate) => ({
        electionId,
        name: candidate.name
      }))
    )
    .returning()
}
