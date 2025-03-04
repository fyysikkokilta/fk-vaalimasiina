'use server'

import { and, eq } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import { z } from 'zod'

import { protectedAction } from '~/actions/utils/isAuthorized'
import { db } from '~/db'
import { candidatesTable, electionsTable } from '~/db/schema'

const editElectionSchema = z.object({
  electionId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().min(1),
  seats: z.number().min(1),
  candidates: z.array(z.string().min(1)).min(1)
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
      message: 'invalid_election_data'
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
        message: 'election_not_found'
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
