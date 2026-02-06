'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { isAuthorizedMiddleware } from '~/actions/middleware/isAuthorized'
import { actionClient, ActionError } from '~/actions/safe-action'
import { db } from '~/db'
import { electionsTable, votersTable } from '~/db/schema'
import { sendVotingMail } from '~/emails/handler'

const startVotingSchema = z.object({
  electionId: z.uuid('Election identifier must be a valid UUID'),
  emails: z
    .array(z.email('Email must be a valid email'), 'Emails must be an array')
    .min(1, 'There must be at least one email')
    .refine(
      (items) => new Set(items).size === items.length,
      'Emails must be unique'
    )
})

export const startVoting = actionClient
  .inputSchema(startVotingSchema)
  .use(isAuthorizedMiddleware)
  .action(async ({ parsedInput: { electionId, emails } }) => {
    return db.transaction(async (transaction) => {
      const elections = await transaction
        .update(electionsTable)
        .set({ status: 'ONGOING' })
        .where(
          and(
            eq(electionsTable.electionId, electionId),
            eq(electionsTable.status, 'CREATED')
          )
        )
        .returning({
          title: electionsTable.title,
          description: electionsTable.description,
          seats: electionsTable.seats,
          status: electionsTable.status
        })

      if (!elections[0]) {
        throw new ActionError('Election not found')
      }

      const voters = await transaction
        .insert(votersTable)
        .values(
          emails.map((email) => ({
            electionId,
            email
          }))
        )
        .returning({
          email: votersTable.email,
          voterId: votersTable.voterId
        })

      const success = await sendVotingMail(voters, { election: elections[0] })
      if (!success) {
        throw new ActionError('Mail sending failed')
      }

      revalidatePath('/[locale]/vote/[voterId]', 'page')
      revalidatePath('/[locale]/admin', 'page')

      return { message: 'Voting started' }
    })
  })
