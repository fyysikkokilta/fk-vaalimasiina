'use server'

import { and, eq } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import { z } from 'zod'

import { protectedAction } from '~/actions/utils/isAuthorized'
import { db } from '~/db'
import { electionsTable } from '~/db/schema'

const startEditingSchema = z.object({
  electionId: z.string().uuid()
})

async function startEditing(electionId: string) {
  const startEditingData = {
    electionId
  }
  const validatedStartEditingData =
    startEditingSchema.safeParse(startEditingData)

  if (!validatedStartEditingData.success) {
    return {
      success: false,
      message: 'invalid_election_identifier'
    }
  }
  const statuses = await db
    .update(electionsTable)
    .set({
      status: 'UPDATING'
    })
    .where(
      and(
        eq(electionsTable.electionId, electionId),
        eq(electionsTable.status, 'CREATED')
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
    message: 'editing_started'
  }
}

export const protectedStartEditing = protectedAction(startEditing)
