'use server'

import { revalidatePath } from 'next/cache'
import { getTranslations } from 'next-intl/server'
import { z } from 'zod'

import { isAuthorizedMiddleware } from '~/actions/middleware/isAuthorized'
import { actionClient } from '~/actions/safe-action'
import { getDb } from '~/db'
import { candidatesTable, electionsTable } from '~/db/schema'

const createElectionSchema = async () => {
  const t = await getTranslations('actions.createElection.validation')
  return z
    .object({
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

export const createElection = actionClient
  .schema(createElectionSchema)
  .use(isAuthorizedMiddleware)
  .action(
    async ({ parsedInput: { title, description, seats, candidates } }) => {
      const t = await getTranslations('actions.createElection.action_status')
      return getDb().transaction(async (transaction) => {
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
