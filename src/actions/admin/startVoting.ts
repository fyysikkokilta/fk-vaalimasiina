'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { isAuthorizedMiddleware } from '~/actions/middleware/isAuthorized'
import { actionClient, ActionError } from '~/actions/safe-action'
import { db } from '~/db'
import { elections, voters } from '~/db/schema'
import { sendVotingMail } from '~/emails/handler'

const startVotingSchema = z.object({
  electionId: z.uuid('Election identifier must be a valid UUID'),
  emails: z
    .array(z.email('Email must be a valid email'), 'Emails must be an array')
    .min(1, 'There must be at least one email')
    .refine((items) => new Set(items).size === items.length, 'Emails must be unique')
})

export const startVoting = actionClient
  .inputSchema(startVotingSchema)
  .use(isAuthorizedMiddleware)
  .action(async ({ parsedInput: { electionId, emails } }) => {
    return db.transaction(async (transaction) => {
      const electionsResult = await transaction
        .update(elections)
        .set({ status: 'ONGOING' })
        .where(and(eq(elections.electionId, electionId), eq(elections.status, 'CREATED')))
        .returning({
          title: elections.title,
          description: elections.description,
          seats: elections.seats,
          status: elections.status
        })

      if (!electionsResult[0]) {
        throw new ActionError('Election not found')
      }

      const votersResult = await transaction
        .insert(voters)
        .values(
          emails.map((email) => ({
            electionId,
            email
          }))
        )
        .returning({
          email: voters.email,
          voterId: voters.voterId
        })

      const result = await sendVotingMail(votersResult, { election: electionsResult[0] })
      if (!result.success) {
        throw new ActionError(
          `Mail sending failed for ${result.failedEmails.length} voter(s): ${result.failedEmails.join(', ')}`
        )
      }

      revalidatePath('/[locale]/vote/[voterId]', 'page')
      revalidatePath('/[locale]/admin', 'page')

      return { message: 'Voting started' }
    })
  })
