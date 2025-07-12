'use server'

import { revalidatePath } from 'next/cache'
import { getTranslations } from 'next-intl/server'
import { z } from 'zod'

import { isAuthorizedMiddleware } from '~/actions/middleware/isAuthorized'
import { actionClient } from '~/actions/safe-action'
import { db } from '~/db'
import { candidatesTable, electionsTable } from '~/db/schema'

const createElectionSchema = async () => {
  const t = await getTranslations('actions.createElection.validation')
  return z
    .object({
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

export const createElection = actionClient
  .inputSchema(createElectionSchema)
  .use(isAuthorizedMiddleware)
  .action(
    async ({ parsedInput: { title, description, seats, candidates } }) => {
      const t = await getTranslations('actions.createElection.action_status')
      return db.transaction(async (transaction) => {
        const elections = await transaction
          .insert(electionsTable)
          .values([
            {
              title,
              description,
              seats
            }
          ])
          .returning({
            electionId: electionsTable.electionId
          })

        await transaction
          .insert(candidatesTable)
          .values(
            candidates.map((candidate) => ({
              electionId: elections[0].electionId,
              name: candidate
            }))
          )
          .returning({
            candidateId: candidatesTable.candidateId,
            name: candidatesTable.name
          })

        revalidatePath('/[locale]/admin', 'page')

        return { message: t('election_created') }
      })
    }
  )
