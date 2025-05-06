'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { getTranslations } from 'next-intl/server'
import { z } from 'zod'

import { isAuthorizedMiddleware } from '~/actions/middleware/isAuthorized'
import { actionClient, ActionError } from '~/actions/safe-action'
import { getDb } from '~/db'
import { candidatesTable, electionsTable } from '~/db/schema'

const editElectionSchema = async () => {
  const t = await getTranslations('actions.editElection.validation')
  return z
    .object({
      electionId: z
        .string({
          message: t('electionId_string')
        })
        .uuid({ message: t('electionId_uuid') }),
      title: z
        .string({ message: t('title_string') })
        .nonempty({ message: t('title_nonempty') }),
      description: z
        .string({ message: t('description_string') })
        .nonempty({ message: t('description_nonempty') }),
      seats: z
        .number({ message: t('seats_number') })
        .min(1, { message: t('seats_min') }),
      candidates: z
        .array(
          z.string({ message: t('candidate_string') }).nonempty({
            message: t('candidate_nonempty')
          }),
          { message: t('candidates_array') }
        )
        .nonempty({ message: t('candidates_nonempty') })
    })
    .refine((data) => data.candidates.length >= data.seats, {
      message: t('candidates_geq_seats')
    })
}

export const editElection = actionClient
  .schema(editElectionSchema)
  .use(isAuthorizedMiddleware)
  .action(
    async ({
      parsedInput: { electionId, title, description, seats, candidates }
    }) => {
      const t = await getTranslations('actions.editElection.action_status')
      return getDb().transaction(async (transaction) => {
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
