'use server'

import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { isAuthorizedMiddleware } from '~/actions/middleware/isAuthorized'
import { actionClient, ActionError } from '~/actions/safe-action'
import { db } from '~/db'
import { candidates, elections } from '~/db/schema'

const editElectionSchema = z
  .object({
    electionId: z.uuid('Election identifier must be a valid UUID'),
    title: z.string('Title must be a string').min(1, 'Title must not be empty'),
    description: z.string('Description must be a string').min(1, 'Description must not be empty'),
    seats: z.number('Seats must be a number').min(1, 'Seats must be at least 1'),
    votingMethod: z.enum(['STV', 'MAJORITY']),
    candidatesData: z
      .array(
        z.string('Candidate must be a string').min(1, 'Candidate must not be empty'),
        'Candidates must be an array'
      )
      .min(1, 'There must be at least one candidate')
  })
  .refine(
    (data) => data.candidatesData.length >= data.seats,
    'There must be at least as many candidates as there are seats'
  )

export const editElection = actionClient
  .inputSchema(editElectionSchema)
  .use(isAuthorizedMiddleware)
  .action(
    async ({
      parsedInput: { electionId, title, description, seats, votingMethod, candidatesData }
    }) => {
      return db.transaction(async (transaction) => {
        const electionsResult = await transaction
          .update(elections)
          .set({
            title,
            description,
            seats,
            votingMethod,
            status: 'CREATED'
          })
          .where(and(eq(elections.electionId, electionId), eq(elections.status, 'UPDATING')))
          .returning({
            electionId: elections.electionId
          })

        if (!electionsResult[0]) {
          throw new ActionError('Election not found')
        }

        await transaction.delete(candidates).where(eq(candidates.electionId, electionId))

        await transaction.insert(candidates).values(
          candidatesData.map((candidate) => ({
            electionId,
            name: candidate
          }))
        )

        revalidatePath('/[locale]/admin', 'page')

        return { message: 'Election edited' }
      })
    }
  )
