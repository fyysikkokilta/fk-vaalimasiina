'use server'

import { eq } from 'drizzle-orm'
import { getTranslations } from 'next-intl/server'
import { z } from 'zod'

import { db } from '~/db'
import { electionsTable, votersTable } from '~/db/schema'
import { sendVotingMail } from '~/emails/handler'
import { isPgUniqueViolation } from '~/utils/dbErrors'

import { isAuthorizedMiddleware } from '../middleware/isAuthorized'
import { actionClient, ActionError } from '../safe-action'

const changeEmailSchema = async () => {
  const t = await getTranslations('actions.changeEmail.validation')
  return z.object({
    oldEmail: z.email({
      pattern: z.regexes.html5Email,
      error: t('oldEmail_email')
    }),
    newEmail: z.email({
      pattern: z.regexes.html5Email,
      error: t('newEmail_email')
    })
  })
}

export const changeEmail = actionClient
  .inputSchema(changeEmailSchema)
  .use(isAuthorizedMiddleware)
  .action(async ({ parsedInput: { oldEmail, newEmail } }) => {
    const t = await getTranslations('actions.changeEmail.action_status')
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
        throw new ActionError(t('voter_not_found'))
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
        throw new ActionError(t('mail_sending_failed'))
      }
      return { message: t('email_changed') }
    } catch (error) {
      if (error instanceof ActionError) {
        throw error
      }
      if (isPgUniqueViolation(error)) {
        throw new ActionError(t('email_already_exists'))
      }
      console.error('Error updating email:', error)
      throw new ActionError(t('error_updating_email'))
    }
  })
