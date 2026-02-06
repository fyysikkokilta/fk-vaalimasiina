'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { isAuthorizedMiddleware } from '~/actions/middleware/isAuthorized'
import { actionClient } from '~/actions/safe-action'
import { db } from '~/db'
import { candidatesTable, electionsTable } from '~/db/schema'

const createElectionSchema = z
  .object({
    title: z.string('Title must be a string').min(1, 'Title must not be empty'),
    description: z
      .string('Description must be a string')
      .min(1, 'Description must not be empty'),
    seats: z
      .number('Seats must be a number')
      .min(1, 'Seats must be at least 1'),
    candidates: z
      .array(
        z
          .string('Candidate must be a string')
          .min(1, 'Candidate must not be empty'),
        'Candidates must be an array'
      )
      .min(1, 'There must be at least one candidate')
  })
  .refine(
    (data) => data.candidates.length >= data.seats,
    'There must be at least as many candidates as there are seats'
  )

export const createElection = actionClient
  .inputSchema(createElectionSchema)
  .use(isAuthorizedMiddleware)
  .action(
    async ({ parsedInput: { title, description, seats, candidates } }) => {
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

        return { message: 'Election created' }
      })
    }
  )
