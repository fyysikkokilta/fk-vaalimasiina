import { createHash } from 'node:crypto'

import { getDb } from '~/db'
import { votersTable } from '~/db/schema'

export const createVoters = async (electionId: string, emails: string[]) => {
  return getDb()
    .insert(votersTable)
    .values(
      emails.map((email) => ({
        electionId,
        email: createHash('sha256').update(email).digest('hex')
      }))
    )
    .returning()
}
