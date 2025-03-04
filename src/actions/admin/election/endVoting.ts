'use server'

import { and, eq, sql } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import { z } from 'zod'

import { protectedAction } from '~/actions/utils/isAuthorized'
import { db } from '~/db'
import { electionsTable, votersTable } from '~/db/schema'

const endVotingSchema = z.object({
  electionId: z.string().uuid()
})

async function endVoting(electionId: string) {
  const endVotingData = {
    electionId
  }
  const validatedEndVotingData = endVotingSchema.safeParse(endVotingData)

  if (!validatedEndVotingData.success) {
    return {
      success: false,
      message: 'invalid_election_identifier'
    }
  }

  return db.transaction(async (transaction) => {
    const voters = await transaction.query.votersTable.findMany({
      with: {
        hasVoted: true
      },
      where: (votersTable, { eq }) => eq(votersTable.electionId, electionId)
    })

    const everyoneVoted = voters.every((voter) => voter.hasVoted)

    if (!everyoneVoted) {
      return {
        success: false,
        message: 'not_everyone_voted'
      }
    }
    const statuses = await transaction
      .update(electionsTable)
      .set({
        status: 'FINISHED'
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

    if (!statuses[0]) {
      return {
        success: false,
        message: 'election_not_found'
      }
    }

    await transaction
      .update(votersTable)
      .set({
        email: sql`encode(sha256(concat('', gen_random_uuid())::bytea), 'hex')`
      })
      .where(eq(votersTable.electionId, electionId))

    revalidateTag('admin-election')
    revalidateTag('auditable-election')

    return {
      success: true,
      message: 'voting_finished'
    }
  })
}

export const protectedEndVoting = protectedAction(endVoting)
