'use server'

import { createHash } from 'crypto'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '~/db'
import { electionsTable, votersTable } from '~/db/schema'
import { sendVotingMail } from '~/emails/handler'
import isUniqueConstraintError from '~/utils/isUniqueConstraintError'

import { protectedAction } from '../utils/isAuthorized'

const changeEmailSchema = z.object({
  oldEmail: z.string().min(1).email(),
  newEmail: z.string().min(1).email()
})

async function changeEmail(_prevState: unknown, formData: FormData) {
  const changeEmailData = Object.fromEntries(formData)
  const validatedChangeEmailData = changeEmailSchema.safeParse(changeEmailData)

  if (!validatedChangeEmailData.success) {
    return {
      success: false,
      message: 'invalid_emails'
    }
  }

  const { oldEmail, newEmail } = validatedChangeEmailData.data
  const hashedOldEmail = createHash('sha256').update(oldEmail).digest('hex')
  const hashedNewEmail = createHash('sha256').update(newEmail).digest('hex')
  try {
    const voterElectionPairs = await db
      .update(votersTable)
      .set({ email: hashedNewEmail })
      .from(electionsTable)
      .where(eq(votersTable.email, hashedOldEmail))
      .returning({
        voter: {
          voterId: votersTable.voterId,
          email: votersTable.email
        },
        election: {
          electionId: electionsTable.electionId,
          title: electionsTable.title,
          description: electionsTable.description,
          seats: electionsTable.seats
        }
      })

    if (!voterElectionPairs[0]) {
      return {
        success: false,
        message: 'voter_not_found'
      }
    }

    const to = [
      {
        email: newEmail,
        voterId: voterElectionPairs[0].voter.voterId
      }
    ]

    const success = await sendVotingMail(to, {
      election: voterElectionPairs[0].election
    })
    if (!success) {
      return {
        success: false,
        message: 'mail_sending_failed'
      }
    }
    return {
      success: true,
      message: 'email_changed'
    }
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        success: false,
        message: 'email_already_exists'
      }
    }
    console.error('Error updating email:', error)
    return {
      success: false,
      message: 'error_updating_email'
    }
  }
}

export const protectedChangeEmail = protectedAction(changeEmail)
