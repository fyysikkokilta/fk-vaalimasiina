'use server'

import { and, eq, sql } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import { getTranslations } from 'next-intl/server'
import { z } from 'zod'

import { isAuthorizedMiddleware } from '~/actions/middleware/isAuthorized'
import { actionClient, ActionError } from '~/actions/safe-action'
import { db } from '~/db'
import { electionsTable, votersTable } from '~/db/schema'

const endVotingSchema = async () => {
  const t = await getTranslations(
    'admin.admin_main.voting_inspection.validation'
  )
  return z.object({
    electionId: z
      .string({
        message: t('electionId_string')
      })
      .uuid({ message: t('electionId_uuid') })
  })
}

export const endVoting = actionClient
  .schema(endVotingSchema)
  .use(isAuthorizedMiddleware)
  .action(async ({ parsedInput: { electionId } }) => {
    const t = await getTranslations('admin.admin_main.voting_inspection')
    return db.transaction(async (transaction) => {
      const voters = await transaction.query.votersTable.findMany({
        with: {
          hasVoted: true
        },
        where: (votersTable, { eq }) => eq(votersTable.electionId, electionId)
      })

      const everyoneVoted = voters.every((voter) => voter.hasVoted)

      if (!everyoneVoted) {
        throw new ActionError(t('not_everyone_voted'))
      }
      const statuses = await transaction
        .update(electionsTable)
        .set({ status: 'FINISHED' })
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
        throw new ActionError(t('election_not_found'))
      }

      await transaction
        .update(votersTable)
        .set({
          email: sql`encode(sha256(concat('', gen_random_uuid())::bytea), 'hex')`
        })
        .where(eq(votersTable.electionId, electionId))

      revalidateTag('admin-election')
      revalidateTag('auditable-election')

      return { message: t('voting_finished') }
    })
  })
