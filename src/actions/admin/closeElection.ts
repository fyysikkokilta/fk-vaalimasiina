'use server'

import { and, eq } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import { getTranslations } from 'next-intl/server'
import { z } from 'zod'

import { isAuthorizedMiddleware } from '~/actions/middleware/isAuthorized'
import { actionClient, ActionError } from '~/actions/safe-action'
import { db } from '~/db'
import { electionsTable } from '~/db/schema'

const closeElectionSchema = async () => {
  const t = await getTranslations('actions.closeElection.validation')
  return z.object({
    electionId: z
      .string({
        message: t('electionId_string')
      })
      .uuid({ message: t('electionId_uuid') })
  })
}

export const closeElection = actionClient
  .schema(closeElectionSchema)
  .use(isAuthorizedMiddleware)
  .action(async ({ parsedInput: { electionId } }) => {
    const t = await getTranslations('actions.closeElection.action_status')
    const statuses = await db
      .update(electionsTable)
      .set({
        status: 'CLOSED'
      })
      .where(
        and(
          eq(electionsTable.electionId, electionId),
          eq(electionsTable.status, 'FINISHED')
        )
      )
      .returning({
        status: electionsTable.status
      })

    if (!statuses[0]) {
      throw new ActionError(t('election_not_found'))
    }

    revalidateTag('admin-election')
    revalidateTag('elections')
    revalidateTag('auditable-election')

    return { message: t('election_closed') }
  })
