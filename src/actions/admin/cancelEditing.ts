'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getTranslations } from 'next-intl/server'
import { z } from 'zod'

import { isAuthorizedMiddleware } from '~/actions/middleware/isAuthorized'
import { actionClient, ActionError } from '~/actions/safe-action'
import { db } from '~/db'
import { electionsTable } from '~/db/schema'

const cancelEditingSchema = async () => {
  const t = await getTranslations('actions.cancelEditing.validation')
  return z.object({
    electionId: z
      .string({
        message: t('electionId_string')
      })
      .uuid({ message: t('electionId_uuid') })
  })
}

export const cancelEditing = actionClient
  .inputSchema(cancelEditingSchema)
  .use(isAuthorizedMiddleware)
  .action(async ({ parsedInput: { electionId } }) => {
    const t = await getTranslations('actions.cancelEditing.action_status')
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
