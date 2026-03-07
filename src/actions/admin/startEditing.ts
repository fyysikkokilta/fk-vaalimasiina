'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { isAuthorizedMiddleware } from '~/actions/middleware/isAuthorized'
import { actionClient, ActionError } from '~/actions/safe-action'
import { db } from '~/db'
import { elections } from '~/db/schema'

const startEditingSchema = z.object({
  electionId: z.uuid('Election identifier must be a valid UUID')
})

export const startEditing = actionClient
  .inputSchema(startEditingSchema)
  .use(isAuthorizedMiddleware)
  .action(async ({ parsedInput: { electionId } }) => {
    const statuses = await db
      .update(elections)
      .set({ status: 'UPDATING' })
      .where(and(eq(elections.electionId, electionId), eq(elections.status, 'CREATED')))
      .returning({ status: elections.status })

    if (!statuses[0]) {
      throw new ActionError('Election not found')
    }

    revalidatePath('/[locale]/admin', 'page')

    return { message: 'Editing started' }
  })
