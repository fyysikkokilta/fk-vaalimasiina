import {
  ballotsTable,
  candidatesTable,
  electionsTable,
  hasVotedTable,
  votersTable,
  votesTable
} from '~/db/schema'

import { router } from '../../init'
import { publicProcedure } from '../../procedures/publicProcedure'

export const testDbRouter = router({
  reset: publicProcedure.mutation(async ({ ctx }) => {
    await ctx.db.transaction(async (transaction) => {
      await transaction.delete(ballotsTable)
      await transaction.delete(candidatesTable)
      await transaction.delete(electionsTable)
      await transaction.delete(votersTable)
      await transaction.delete(votesTable)
      await transaction.delete(hasVotedTable)
    })
    return { message: 'Database reset successfully' }
  })
})
