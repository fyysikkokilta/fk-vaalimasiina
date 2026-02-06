'use server'

import { and, eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { isAuthorizedMiddleware } from '~/actions/middleware/isAuthorized'
import { actionClient, ActionError } from '~/actions/safe-action'
import { db } from '~/db'
import { electionsTable, votersTable } from '~/db/schema'

const endVotingSchema = z.object({
  electionId: z.uuid('Election identifier must be a valid UUID')
})

export const endVoting = actionClient
  .inputSchema(endVotingSchema)
  .use(isAuthorizedMiddleware)
  .action(async ({ parsedInput: { electionId } }) => {
    return db.transaction(async (transaction) => {
      const voters = await transaction.query.votersTable.findMany({
        with: {
          hasVoted: true
        },
        where: (votersTable, { eq }) => eq(votersTable.electionId, electionId)
      })

      const everyoneVoted = voters.every((voter) => voter.hasVoted)

      if (!everyoneVoted) {
        throw new ActionError('Not everyone has voted')
      }
      const statuses = await transaction
        .update(electionsTable)
        .set({ status: 'FINISHED' })
        .where(
          and(
            eq(electionsTable.electionId, electionId),
            eq(electionsTable.status, 'ONGOING')
          )
        )
        .returning({
          status: electionsTable.status
        })

      if (!statuses[0]) {
        throw new ActionError('Election not found')
      }

      await transaction
        .update(votersTable)
        .set({
          email: sql`encode(sha256(concat('', gen_random_uuid())::bytea), 'hex')`
        })
        .where(eq(votersTable.electionId, electionId))

      revalidatePath('/[locale]/audit', 'page')
      revalidatePath('/[locale]/vote/[voterId]', 'page')
      revalidatePath('/[locale]/admin', 'page')

      return { message: 'Voting finished' }
    })
  })
