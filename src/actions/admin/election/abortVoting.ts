'use server'

import { and, eq } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import { z } from 'zod'

import { protectedAction } from '~/actions/utils/isAuthorized'
import { db } from '~/db'
import { ballotsTable, electionsTable, votersTable } from '~/db/schema'

const abortVotingSchema = z.object({
  electionId: z.string().uuid()
})

async function abortVoting(electionId: string) {
  const abortVotingData = {
    electionId
  }
  const validatedAbortVotingData = abortVotingSchema.safeParse(abortVotingData)

  if (!validatedAbortVotingData.success) {
    return {
      success: false,
      message: 'invalid_election_identifier'
    }
  }

  const statuses = await db.transaction(async (transaction) => {
    await transaction
      .delete(votersTable)
      .where(eq(votersTable.electionId, electionId))

    await transaction
      .delete(ballotsTable)
      .where(eq(ballotsTable.electionId, electionId))

    return await transaction
      .update(electionsTable)
      .set({
        status: 'CREATED'
      })
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
    return {
      success: false,
      message: 'election_not_found'
    }
  }

  revalidateTag('admin-election')

  return {
    success: true,
    message: 'voting_aborted'
  }
}

export const protectedAbortVoting = protectedAction(abortVoting)
