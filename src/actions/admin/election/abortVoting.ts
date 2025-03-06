'use server'

import { and, eq } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import { getTranslations } from 'next-intl/server'
import { z } from 'zod'

import { isAuthorizedMiddleware } from '~/actions/middleware/isAuthorized'
import { actionClient, ActionError } from '~/actions/safe-action'
import { db } from '~/db'
import { ballotsTable, electionsTable, votersTable } from '~/db/schema'

const abortVotingSchema = async () => {
  const t = await getTranslations(
    'admin.admin_main.voting_inspection.validation'
  )
  return z.object({
    electionId: z
      .string({
        message: t('electionId_string')
      })
      .uuid({ message: t('electionId_uuid') })
  })
}

export const abortVoting = actionClient
  .schema(abortVotingSchema)
  .use(isAuthorizedMiddleware)
  .action(async ({ parsedInput: { electionId } }) => {
    const t = await getTranslations('admin.admin_main.voting_inspection')
    const statuses = await db.transaction(async (transaction) => {
      await transaction
        .delete(votersTable)
        .where(eq(votersTable.electionId, electionId))

      await transaction
        .delete(ballotsTable)
        .where(eq(ballotsTable.electionId, electionId))

      return await transaction
        .update(electionsTable)
        .set({ status: 'CREATED' })
        .where(
          and(
            eq(electionsTable.electionId, electionId),
            eq(electionsTable.status, 'ONGOING')
          )
        )
        .returning({
          status: electionsTable.status
        })
    })

    if (!statuses[0]) {
      throw new ActionError(t('election_not_found'))
    }

    revalidateTag('admin-election')

    return { message: t('voting_aborted') }
  })
