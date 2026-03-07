'use server'

import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { isAuthorizedMiddleware } from '~/actions/middleware/isAuthorized'
import { actionClient, ActionError } from '~/actions/safe-action'
import { db } from '~/db'
import { elections, voters } from '~/db/schema'
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
        .update(voters)
        .set({ email: normalizedNewEmail })
        .from(elections)
        .where(eq(voters.email, normalizedOldEmail))
        .returning({
          voter: {
            voterId: voters.voterId,
            email: voters.email
          },
          election: {
            electionId: elections.electionId,
            title: elections.title,
            description: elections.description,
            seats: elections.seats
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

      const result = await sendVotingMail(to, {
        election: voterElectionPairs[0].election
      })
      if (!result.success) {
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
