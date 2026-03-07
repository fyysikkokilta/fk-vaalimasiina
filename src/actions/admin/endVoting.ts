'use server'

import { and, eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { isAuthorizedMiddleware } from '~/actions/middleware/isAuthorized'
import { actionClient, ActionError } from '~/actions/safe-action'
import { db } from '~/db'
import { elections, voters } from '~/db/schema'

const endVotingSchema = z.object({
  electionId: z.uuid('Election identifier must be a valid UUID')
})

export const endVoting = actionClient
  .inputSchema(endVotingSchema)
  .use(isAuthorizedMiddleware)
  .action(async ({ parsedInput: { electionId } }) => {
    return db.transaction(async (transaction) => {
      const votersResult = await transaction.query.voters.findMany({
        with: {
          hasVoteds: true
        },
        where: {
          electionId
        }
      })

      const everyoneVoted = votersResult.every((voter) => voter.hasVoteds.length > 0)

      if (!everyoneVoted) {
        throw new ActionError('Not everyone has voted')
      }
      const statuses = await transaction
        .update(elections)
        .set({ status: 'FINISHED' })
        .where(and(eq(elections.electionId, electionId), eq(elections.status, 'ONGOING')))
        .returning({
          status: elections.status
        })

      if (!statuses[0]) {
        throw new ActionError('Election not found')
      }

      await transaction
        .update(voters)
        .set({
          email: sql`encode(sha256(concat('', gen_random_uuid())::bytea), 'hex')`
        })
        .where(eq(voters.electionId, electionId))

      revalidatePath('/[locale]/audit', 'page')
      revalidatePath('/[locale]/vote/[voterId]', 'page')
      revalidatePath('/[locale]/admin', 'page')

      return { message: 'Voting finished' }
    })
  })
