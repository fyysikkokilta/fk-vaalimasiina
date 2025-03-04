'use server'

import { and, eq } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import { z } from 'zod'

import { protectedAction } from '~/actions/utils/isAuthorized'
import { db } from '~/db'
import { electionsTable } from '~/db/schema'

const closeElectionSchema = z.object({
  electionId: z.string().uuid()
})

async function closeElection(electionId: string) {
  const closeElectionData = {
    electionId
  }
  const validatedCloseElectionData =
    closeElectionSchema.safeParse(closeElectionData)

  if (!validatedCloseElectionData.success) {
    return {
      success: false,
      message: 'invalid_close_election_data'
    }
  }

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
    return {
      success: false,
      message: 'election_not_found'
    }
  }

  revalidateTag('admin-election')
  revalidateTag('elections')
  revalidateTag('auditable-election')

  return {
    success: true,
    message: 'election_closed'
  }
}

export const protectedCloseElection = protectedAction(closeElection)
