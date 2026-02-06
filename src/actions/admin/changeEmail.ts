'use server'

import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { isAuthorizedMiddleware } from '~/actions/middleware/isAuthorized'
import { actionClient, ActionError } from '~/actions/safe-action'
import { db } from '~/db'
import { electionsTable, votersTable } from '~/db/schema'
import { sendVotingMail } from '~/emails/handler'
import { isPgUniqueViolation } from '~/utils/dbErrors'

const changeEmailSchema = z.object({
  oldEmail: z.email('Old email must be a valid email'),
  newEmail: z.email('New email must be a valid email')
})

export const changeEmail = actionClient
  .inputSchema(changeEmailSchema)
  .use(isAuthorizedMiddleware)
  .action(async ({ parsedInput: { oldEmail, newEmail } }) => {
    const normalizedOldEmail = oldEmail.trim().toLowerCase()
    const normalizedNewEmail = newEmail.trim().toLowerCase()
    try {
      const voterElectionPairs = await db
        .update(votersTable)
        .set({ email: normalizedNewEmail })
        .from(electionsTable)
        .where(eq(votersTable.email, normalizedOldEmail))
        .returning({
          voter: {
            voterId: votersTable.voterId,
            email: votersTable.email
          },
          election: {
            electionId: electionsTable.electionId,
            title: electionsTable.title,
            description: electionsTable.description,
            seats: electionsTable.seats
          }
        })

      if (!voterElectionPairs[0]) {
        throw new ActionError('Voter not found')
      }

      const to = [
        {
          email: normalizedNewEmail,
          voterId: voterElectionPairs[0].voter.voterId
        }
      ]

      const success = await sendVotingMail(to, {
        election: voterElectionPairs[0].election
      })
      if (!success) {
        throw new ActionError('Mail sending failed')
      }
      return { message: 'Email changed' }
    } catch (error) {
      if (error instanceof ActionError) {
        throw error
      }
      if (isPgUniqueViolation(error)) {
        throw new ActionError('Email already exists')
      }
      console.error('Error updating email:', error)
      throw new ActionError('Error updating email')
    }
  })
