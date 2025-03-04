import { db } from '~/db'
import {
  ballotsTable,
  candidatesTable,
  electionsTable,
  hasVotedTable,
  votersTable,
  votesTable
} from '~/db/schema'

export const clearTables = async () => {
  await db.transaction(async (transaction) => {
    await transaction.delete(ballotsTable)
    await transaction.delete(candidatesTable)
    await transaction.delete(electionsTable)
    await transaction.delete(votersTable)
    await transaction.delete(votesTable)
    await transaction.delete(hasVotedTable)
  })

  return { message: 'Database reset successfully' }
}
