import { db } from '../../db'
import { votersTable } from '../../db/schema'

export const createTestVoters = async (
  electionId: string,
  emails: string[]
) => {
  return db
    .insert(votersTable)
    .values(
      emails.map((email) => ({
        electionId,
        email
      }))
    )
    .returning()
}
