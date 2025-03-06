'use server'

import { createHash } from 'crypto'
import { and, eq } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import { getTranslations } from 'next-intl/server'
import { z } from 'zod'

import { isAuthorizedMiddleware } from '~/actions/middleware/isAuthorized'
import { actionClient, ActionError } from '~/actions/safe-action'
import { db } from '~/db'
import { electionsTable, votersTable } from '~/db/schema'
import { sendVotingMail } from '~/emails/handler'

const startVotingSchame = async () => {
  const t = await getTranslations(
    'admin.admin_main.preview_election.validation'
  )
  return z.object({
    electionId: z
      .string({
        message: t('electionId_string')
      })
      .uuid({ message: t('electionId_uuid') }),
    emails: z
      .array(
        z
          .string({
            message: t('email_string')
          })
          .nonempty({ message: t('email_nonempty') })
          .email({ message: t('email_email') }),
        {
          message: t('emails_array')
        }
      )
      .nonempty({ message: t('emails_nonempty') })
      .refine((items) => new Set(items).size === items.length, {
        message: t('emails_unique')
      })
  })
}

export const startVoting = actionClient
  .schema(startVotingSchame)
  .use(isAuthorizedMiddleware)
  .action(async ({ parsedInput: { electionId, emails } }) => {
    const t = await getTranslations('admin.admin_main.preview_election')
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

      const emailsData = emails.map((email) => ({
        email,
        hash: createHash('sha256').update(email).digest('hex')
      }))

      const insertedVoters = await transaction
        .insert(votersTable)
        .values(
          emailsData.map((email) => ({
            electionId,
            email: email.hash
          }))
        )
        .returning()

      const voters = insertedVoters.map((voter) => ({
        email: emailsData.find((email) => email.hash === voter.email)!.email,
        voterId: voter.voterId
      }))

      const success = await sendVotingMail(voters, { election: elections[0] })
      if (!success) {
        throw new ActionError(t('mail_sending_failed'))
      }

      revalidateTag('admin-election')

      return { message: t('voting_started') }
    })
  })
