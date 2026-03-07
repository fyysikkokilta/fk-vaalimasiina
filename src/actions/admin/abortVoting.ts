'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { isAuthorizedMiddleware } from '~/actions/middleware/isAuthorized'
import { actionClient, ActionError } from '~/actions/safe-action'
import { db } from '~/db'
import { ballots, elections, voters } from '~/db/schema'

const abortVotingSchema = z.object({
  electionId: z.uuid('Election identifier must be a valid UUID')
})

export const abortVoting = actionClient
  .inputSchema(abortVotingSchema)
  .use(isAuthorizedMiddleware)
  .action(async ({ parsedInput: { electionId } }) => {
    const statuses = await db.transaction(async (transaction) => {
      await transaction.delete(voters).where(eq(voters.electionId, electionId))

      await transaction.delete(ballots).where(eq(ballots.electionId, electionId))

      return await transaction
        .update(elections)
        .set({ status: 'CREATED' })
        .where(and(eq(elections.electionId, electionId), eq(elections.status, 'ONGOING')))
        .returning({
          status: elections.status
        })
    })

    if (!statuses[0]) {
      throw new ActionError('Election not found')
    }

    revalidatePath('/[locale]/vote/[voterId]', 'page')
    revalidatePath('/[locale]/admin', 'page')

    return { message: 'Voting aborted' }
  })
