'use server'

import { createHash } from 'crypto'
import { eq } from 'drizzle-orm'
import { getTranslations } from 'next-intl/server'
import { z } from 'zod'

import { db } from '~/db'
import { electionsTable, votersTable } from '~/db/schema'
import { sendVotingMail } from '~/emails/handler'

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
    const hashedOldEmail = createHash('sha256').update(oldEmail).digest('hex')
    const hashedNewEmail = createHash('sha256').update(newEmail).digest('hex')
    try {
      const voterElectionPairs = await db
        .update(votersTable)
        .set({ email: hashedNewEmail })
        .from(electionsTable)
        .where(eq(votersTable.email, hashedOldEmail))
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
          email: newEmail,
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.cause.code === '23505') {
        console.log('Email already exists')
        throw new ActionError(t('email_already_exists'))
      }
      console.error('Error updating email:', error)
      throw new ActionError(t('error_updating_email'))
    }
  })
