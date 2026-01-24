'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { isAuthorizedMiddleware } from '~/actions/middleware/isAuthorized'
import { actionClient, ActionError } from '~/actions/safe-action'
import { getActionsTranslations } from '~/actions/utils/getActionsTranslations'
import { db } from '~/db'
import { electionsTable } from '~/db/schema'

const cancelEditingSchema = async () => {
  const t = await getActionsTranslations('actions.cancelEditing.validation')
  return z.object({
    electionId: z.uuid({ error: t('electionId_uuid') })
  })
}

export const cancelEditing = actionClient
  .inputSchema(cancelEditingSchema)
  .use(isAuthorizedMiddleware)
  .action(async ({ parsedInput: { electionId } }) => {
    const t = await getActionsTranslations(
      'actions.cancelEditing.action_status'
    )
    const statuses = await db
      .update(electionsTable)
      .set({ status: 'CREATED' })
      .where(
        and(
          eq(electionsTable.electionId, electionId),
          eq(electionsTable.status, 'UPDATING')
        )
      )
      .returning({ status: electionsTable.status })

    if (!statuses[0]) {
      throw new ActionError(t('election_not_found'))
    }

    revalidatePath('/[locale]/admin', 'page')

    return { message: t('editing_cancelled') }
  })
