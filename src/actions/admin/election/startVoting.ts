'use server'

import { createHash } from 'crypto'
import { and, eq } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import { z } from 'zod'

import { protectedAction } from '~/actions/utils/isAuthorized'
import { db } from '~/db'
import { electionsTable, votersTable } from '~/db/schema'
import { sendVotingMail } from '~/emails/handler'

const startVotingSchame = z.object({
  electionId: z
    .string({
      message: 'validation.electionId_string'
    })
    .uuid({ message: 'validation.electionId_uuid' }),
  emails: z
    .array(
      z
        .string({
          message: 'validation.email_string'
        })
        .nonempty({ message: 'validation.email_nonempty' })
        .email({ message: 'validation.email_email' }),
      {
        message: 'validation.emails_array'
      }
    )
    .nonempty({ message: 'validation.emails_nonempty' })
    .refine((items) => new Set(items).size === items.length, {
      message: 'validation.emails_unique'
    })
})

async function startVoting(
  electionId: string,
  _prevState: unknown,
  formData: FormData
) {
  const startVotingData = {
    electionId,
    emails: (formData.get('emails') as string)
      .split('\n')
      .map((email) => email.trim())
      .map((email) => email.toLowerCase())
      .filter(Boolean)
  }

  const validatedStartVotingData = startVotingSchame.safeParse(startVotingData)

  if (!validatedStartVotingData.success) {
    return {
      success: false,
      message: 'invalid_voter_data',
      errors: validatedStartVotingData.error.formErrors,
      formData
    }
  }

  const { emails } = validatedStartVotingData.data
  return db.transaction(async (transaction) => {
    const elections = await transaction
      .update(electionsTable)
      .set({
        status: 'ONGOING'
      })
      .where(
        and(
          eq(electionsTable.electionId, electionId),
          eq(electionsTable.status, 'CREATED')
        )
      )
      .returning({
        title: electionsTable.title,
        description: electionsTable.description,
        seats: electionsTable.seats,
        status: electionsTable.status
      })

    if (!elections[0]) {
      return {
        success: false,
        message: 'election_not_found',
        formData
      }
    }

    const emailsData = emails.map((email) => ({
      email,
      hash: createHash('sha256').update(email).digest('hex')
    }))

    const insertedVoters = await transaction
      .insert(votersTable)
      .values(
        emailsData.map((email) => ({
          electionId,
          email: email.hash
        }))
      )
      .returning()

    const voters = insertedVoters.map((voter) => ({
      email: emailsData.find((email) => email.hash === voter.email)!.email,
      voterId: voter.voterId
    }))

    const success = await sendVotingMail(voters, { election: elections[0] })
    if (!success) {
      return {
        success: false,
        message: 'mail_sending_failed',
        formData
      }
    }

    revalidateTag('admin-election')

    return {
      success: true,
      message: 'voting_started'
    }
  })
}

export const protectedStartVoting = protectedAction(startVoting)
