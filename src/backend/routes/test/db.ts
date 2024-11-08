import { db } from '../../db'
import {
  ballotsTable,
  candidatesTable,
  electionsTable,
  votersTable,
  votesTable
} from '../../db/schema'

export const resetDatabase = async () => {
  await db.transaction(async (transaction) => {
    await transaction.delete(ballotsTable)
    await transaction.delete(candidatesTable)
    await transaction.delete(electionsTable)
    await transaction.delete(votersTable)
    await transaction.delete(votesTable)
  })
}
