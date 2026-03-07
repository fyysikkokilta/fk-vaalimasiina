import { db } from '~/db'
import { ballots, candidates, elections, hasVoted, voters, votes } from '~/db/schema'

export const clearTables = async () => {
  await db.transaction(async (transaction) => {
    await transaction.delete(ballots)
    await transaction.delete(candidates)
    await transaction.delete(elections)
    await transaction.delete(voters)
    await transaction.delete(votes)
    await transaction.delete(hasVoted)
  })

  return { message: 'Database reset successfully' }
}
