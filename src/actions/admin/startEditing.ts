'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { isAuthorizedMiddleware } from '~/actions/middleware/isAuthorized'
import { actionClient, ActionError } from '~/actions/safe-action'
import { getActionsTranslations } from '~/actions/utils/getActionsTranslations'
import { db } from '~/db'
import { electionsTable } from '~/db/schema'

const startEditingSchema = async () => {
  const t = await getActionsTranslations('actions.startEditing.validation')
  return z.object({
    electionId: z.uuid({ error: t('electionId_uuid') })
  })
}

export const startEditing = actionClient
  .inputSchema(startEditingSchema)
  .use(isAuthorizedMiddleware)
  .action(async ({ parsedInput: { electionId } }) => {
    const t = await getActionsTranslations('actions.startEditing.action_status')
    const statuses = await db
      .update(electionsTable)
      .set({ status: 'UPDATING' })
      .where(
        and(
          eq(electionsTable.electionId, electionId),
          eq(electionsTable.status, 'CREATED')
        )
      )
      .returning({ status: electionsTable.status })

    if (!statuses[0]) {
      throw new ActionError(t('election_not_found'))
    }

    revalidatePath('/[locale]/admin', 'page')

    return { message: t('editing_started') }
  })
