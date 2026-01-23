'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getTranslations } from 'next-intl/server'
import { z } from 'zod'

import { isAuthorizedMiddleware } from '~/actions/middleware/isAuthorized'
import { actionClient, ActionError } from '~/actions/safe-action'
import { db } from '~/db'
import { electionsTable, votersTable } from '~/db/schema'
import { sendVotingMail } from '~/emails/handler'

const startVotingSchame = async () => {
  const t = await getTranslations('actions.startVoting.validation')

  return z.object({
    electionId: z.uuid({
      error: t('electionId_uuid')
    }),
    emails: z
      .array(
        z.email({
          pattern: z.regexes.html5Email,
          error: t('email_email')
        }),
        { error: t('emails_array') }
      )
      .nonempty({ error: t('emails_nonempty') })
      .refine((items) => new Set(items).size === items.length, {
        error: t('emails_unique')
      })
  })
}

export const startVoting = actionClient
  .inputSchema(startVotingSchame)
  .use(isAuthorizedMiddleware)
  .action(async ({ parsedInput: { electionId, emails } }) => {
    const t = await getTranslations('actions.startVoting.action_status')
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
        throw new ActionError(t('election_not_found'))
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
        throw new ActionError(t('mail_sending_failed'))
      }

      revalidatePath('/[locale]/vote/[voterId]', 'page')
      revalidatePath('/[locale]/admin', 'page')

      return { message: t('voting_started') }
    })
  })
