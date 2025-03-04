'use server'

import { revalidateTag } from 'next/cache'
import { z } from 'zod'

import { protectedAction } from '~/actions/utils/isAuthorized'
import { db } from '~/db'
import { candidatesTable, electionsTable } from '~/db/schema'

const createElectionSchema = z.object({
  title: z.string(),
  description: z.string(),
  seats: z.number(),
  candidates: z.array(z.string().min(1)).min(1)
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
      message: 'invalid_election_data'
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
