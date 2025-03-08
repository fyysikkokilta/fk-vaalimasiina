'use server'

import { and, eq } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import { getTranslations } from 'next-intl/server'
import { z } from 'zod'

import { isAuthorizedMiddleware } from '~/actions/middleware/isAuthorized'
import { actionClient, ActionError } from '~/actions/safe-action'
import { db } from '~/db'
import { electionsTable } from '~/db/schema'

const startEditingSchema = async () => {
  const t = await getTranslations('actions.startEditing.validation')
  return z.object({
    electionId: z
      .string({
        message: t('electionId_string')
      })
      .uuid({ message: t('electionId_uuid') })
  })
}

export const startEditing = actionClient
  .schema(startEditingSchema)
  .use(isAuthorizedMiddleware)
  .action(async ({ parsedInput: { electionId } }) => {
    const t = await getTranslations('actions.startEditing.action_status')
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

    revalidateTag('admin-election')

    return { message: t('editing_started') }
  })
