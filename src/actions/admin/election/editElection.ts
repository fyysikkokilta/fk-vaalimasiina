'use server'

import { and, eq } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import { z } from 'zod'

import { protectedAction } from '~/actions/utils/isAuthorized'
import { db } from '~/db'
import { candidatesTable, electionsTable } from '~/db/schema'

const editElectionSchema = z
  .object({
    electionId: z
      .string({
        message: 'validation.electionId_string'
      })
      .uuid({ message: 'validation.electionId_uuid' }),
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

async function editElection(
  electionId: string,
  _prevState: unknown,
  formData: FormData
) {
  const editElectionFormData = {
    ...Object.fromEntries(formData),
    electionId,
    seats: Number(Object.fromEntries(formData).seats),
    candidates: formData.getAll('candidates')
  }

  const validatedEditElectionFormData =
    editElectionSchema.safeParse(editElectionFormData)

  if (!validatedEditElectionFormData.success) {
    return {
      success: false,
      message: 'invalid_election_data',
      errors: validatedEditElectionFormData.error.formErrors,
      formData
    }
  }

  const { title, description, seats, candidates } =
    validatedEditElectionFormData.data
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
      return {
        success: false,
        message: 'election_not_found',
        formData
      }
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

    revalidateTag('admin-election')

    return {
      success: true,
      message: 'election_edited'
    }
  })
}

export const protectedEditElection = protectedAction(editElection)
