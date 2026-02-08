'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { isAuthorizedMiddleware } from '~/actions/middleware/isAuthorized'
import { actionClient, ActionError } from '~/actions/safe-action'
import { db } from '~/db'
import { ballotsTable, electionsTable, votersTable } from '~/db/schema'

const abortVotingSchema = z.object({
  electionId: z.uuid('Election identifier must be a valid UUID')
})

export const abortVoting = actionClient
  .inputSchema(abortVotingSchema)
  .use(isAuthorizedMiddleware)
  .action(async ({ parsedInput: { electionId } }) => {
    const statuses = await db.transaction(async (transaction) => {
      await transaction.delete(votersTable).where(eq(votersTable.electionId, electionId))

      await transaction.delete(ballotsTable).where(eq(ballotsTable.electionId, electionId))

      return await transaction
        .update(electionsTable)
        .set({ status: 'CREATED' })
        .where(and(eq(electionsTable.electionId, electionId), eq(electionsTable.status, 'ONGOING')))
        .returning({
          status: electionsTable.status
        })
    })

    if (!statuses[0]) {
      throw new ActionError('Election not found')
    }

    revalidatePath('/[locale]/vote/[voterId]', 'page')
    revalidatePath('/[locale]/admin', 'page')

    return { message: 'Voting aborted' }
  })
