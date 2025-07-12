'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getTranslations } from 'next-intl/server'
import { z } from 'zod'

import { isAuthorizedMiddleware } from '~/actions/middleware/isAuthorized'
import { actionClient, ActionError } from '~/actions/safe-action'
import { db } from '~/db'
import { candidatesTable, electionsTable } from '~/db/schema'

const editElectionSchema = async () => {
  const t = await getTranslations('actions.editElection.validation')
  return z
    .object({
      electionId: z.uuid({ error: t('electionId_uuid') }),
      title: z
        .string({ error: t('title_string') })
        .nonempty({ error: t('title_nonempty') }),
      description: z
        .string({ error: t('description_string') })
        .nonempty({ error: t('description_nonempty') }),
      seats: z
        .number({ error: t('seats_number') })
        .min(1, { error: t('seats_min') }),
      candidates: z
        .array(
          z.string({ error: t('candidate_string') }).nonempty({
            error: t('candidate_nonempty')
          }),
          { error: t('candidates_array') }
        )
        .nonempty({ error: t('candidates_nonempty') })
    })
    .refine((data) => data.candidates.length >= data.seats, {
      error: t('candidates_geq_seats')
    })
}

export const editElection = actionClient
  .inputSchema(editElectionSchema)
  .use(isAuthorizedMiddleware)
  .action(
    async ({
      parsedInput: { electionId, title, description, seats, candidates }
    }) => {
      const t = await getTranslations('actions.editElection.action_status')
      return db.transaction(async (transaction) => {
        const elections = await transaction
          .update(electionsTable)
          .set({
            title,
            description,
            seats,
            status: 'CREATED'
          })
          .where(
            and(
              eq(electionsTable.electionId, electionId),
              eq(electionsTable.status, 'UPDATING')
            )
          )
          .returning({
            electionId: electionsTable.electionId
          })

        if (!elections[0]) {
          throw new ActionError(t('election_not_found'))
        }

        await transaction
          .delete(candidatesTable)
          .where(eq(candidatesTable.electionId, electionId))

        await transaction.insert(candidatesTable).values(
          candidates.map((candidate) => ({
            electionId,
            name: candidate
          }))
        )

        revalidatePath('/[locale]/admin', 'page')

        return { message: t('election_edited') }
      })
    }
  )
