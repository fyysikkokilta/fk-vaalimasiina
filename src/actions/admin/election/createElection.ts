'use server'

import { revalidateTag } from 'next/cache'
import { z } from 'zod'

import { protectedAction } from '~/actions/utils/isAuthorized'
import { db } from '~/db'
import { candidatesTable, electionsTable } from '~/db/schema'

const createElectionSchema = z
  .object({
    title: z
      .string({ message: 'validation.title_string' })
      .nonempty({ message: 'validation.title_nonempty' }),
    description: z
      .string({ message: 'validation.description_string' })
      .nonempty({ message: 'validation.description_nonempty' }),
    seats: z
      .number({ message: 'validation.seats_number' })
      .min(1, { message: 'validation.seats_min' }),
    candidates: z
      .array(
        z.string({ message: 'validation.candidate_string' }).nonempty({
          message: 'validation.candidate_nonempty'
        }),
        { message: 'validation.candidates_array' }
      )
      .nonempty({ message: 'validation.candidates_nonempty' })
  })
  .refine((data) => data.candidates.length >= data.seats, {
    message: 'validation.candidates_geq_seats'
  })

async function createElection(_prevState: unknown, formData: FormData) {
  const createElectionFormData = {
    ...Object.fromEntries(formData),
    seats: Number(Object.fromEntries(formData).seats),
    candidates: formData.getAll('candidates')
  }

  const validatedCreateElectionFormData = createElectionSchema.safeParse(
    createElectionFormData
  )

  if (!validatedCreateElectionFormData.success) {
    return {
      success: false,
      message: 'invalid_election_data',
      errors: validatedCreateElectionFormData.error.formErrors,
      formData
    }
  }

  const { title, description, seats, candidates } =
    validatedCreateElectionFormData.data

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

    revalidateTag('admin-election')

    return {
      success: true,
      message: 'election_created'
    }
  })
}

export const protectedCreateElection = protectedAction(createElection)
