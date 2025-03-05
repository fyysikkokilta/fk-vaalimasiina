'use server'

import { and, eq } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import { z } from 'zod'

import { protectedAction } from '~/actions/utils/isAuthorized'
import { db } from '~/db'
import { electionsTable } from '~/db/schema'

const cancelEditingSchema = z.object({
  electionId: z
    .string({
      message: 'validation.electionId_string'
    })
    .uuid({ message: 'validation.electionId_uuid' })
})

async function cancelEditing(electionId: string) {
  const cancelEditingData = {
    electionId
  }

  const validatedCancelEditingData =
    cancelEditingSchema.safeParse(cancelEditingData)

  if (!validatedCancelEditingData.success) {
    return {
      success: false,
      message: 'invalid_election_identifier'
    }
  }

  const statuses = await db
    .update(electionsTable)
    .set({
      status: 'CREATED'
    })
    .where(
      and(
        eq(electionsTable.electionId, electionId),
        eq(electionsTable.status, 'UPDATING')
      )
    )
    .returning({ status: electionsTable.status })

  if (!statuses[0]) {
    return {
      success: false,
      message: 'election_not_found'
    }
  }

  revalidateTag('admin-election')

  return {
    success: true,
    message: 'cancelled_editing'
  }
}

export const protectedCancelEditing = protectedAction(cancelEditing)
