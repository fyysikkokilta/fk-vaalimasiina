import { db } from '~/db'
import { voters } from '~/db/schema'

export const createVoters = async (electionId: string, emails: string[]) => {
  return db
    .insert(voters)
    .values(
      emails.map((email) => ({
        electionId,
        email
      }))
    )
    .returning()
}
