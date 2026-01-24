'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { isAuthorizedMiddleware } from '~/actions/middleware/isAuthorized'
import { actionClient, ActionError } from '~/actions/safe-action'
import { getActionsTranslations } from '~/actions/utils/getActionsTranslations'
import { db } from '~/db'
import { ballotsTable, electionsTable, votersTable } from '~/db/schema'

const abortVotingSchema = async () => {
  const t = await getActionsTranslations('actions.abortVoting.validation')
  return z.object({
    electionId: z.uuid({ error: t('electionId_uuid') })
  })
}

export const abortVoting = actionClient
  .inputSchema(abortVotingSchema)
  .use(isAuthorizedMiddleware)
  .action(async ({ parsedInput: { electionId } }) => {
    const t = await getActionsTranslations('actions.abortVoting.action_status')
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

    revalidatePath('/[locale]/vote/[voterId]', 'page')
    revalidatePath('/[locale]/admin', 'page')

    return { message: t('voting_aborted') }
  })
