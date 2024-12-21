import { createHash } from 'node:crypto'

import { eq } from 'drizzle-orm'

import { db } from '../../db'
import {
  ballotsTable,
  candidatesTable,
  electionsTable,
  votersTable
} from '../../db/schema'
import EmailService from '../../emails/handler'

export const createElection = async (
  title: string,
  description: string,
  seats: number,
  candidatesData: { name: string }[]
) => {
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
      .returning()

    const candidates = await transaction
      .insert(candidatesTable)
      .values(
        candidatesData.map((candidate) => ({
          electionId: elections[0].electionId,
          name: candidate.name
        }))
      )
      .returning()

    return { ...elections[0], candidates }
  })
}

export const updateElection = async (
  electionId: string,
  title: string,
  description: string,
  seats: number,
  candidatesData: { name: string }[]
) => {
  const election = await db.transaction(async (transaction) => {
    const elections = await transaction
      .update(electionsTable)
      .set({
        title,
        description,
        seats
      })
      .where(eq(electionsTable.electionId, electionId))
      .returning()

    if (!elections[0]) {
      return null
    }

    await transaction
      .delete(candidatesTable)
      .where(eq(candidatesTable.electionId, electionId))

    const candidates = await transaction
      .insert(candidatesTable)
      .values(
        candidatesData.map((candidate) => ({
          electionId,
          name: candidate.name
        }))
      )
      .returning()

    return { ...elections[0], candidates }
  })

  return election || null
}

export const startVoting = async (electionId: string, emails: string[]) => {
  const [election, insertedVoters] = await db.transaction(
    async (transaction) => {
      const elections = await transaction
        .update(electionsTable)
        .set({
          status: 'ONGOING'
        })
        .where(eq(electionsTable.electionId, electionId))
        .returning()

      if (!elections[0]) {
        return [null, []]
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

      return [elections[0], voters]
    }
  )

  if (!election) {
    return null
  }

  await EmailService.sendVotingMail(insertedVoters, { election })

  return election
}

export const endVoting = async (electionId: string) => {
  const elections = await db
    .update(electionsTable)
    .set({
      status: 'FINISHED'
    })
    .where(eq(electionsTable.electionId, electionId))
    .returning()

  return elections[0] || null
}

export const closeElection = async (electionId: string) => {
  const elections = await db
    .update(electionsTable)
    .set({
      status: 'CLOSED'
    })
    .where(eq(electionsTable.electionId, electionId))
    .returning()

  return elections[0] || null
}

export const abortVoting = async (electionId: string) => {
  const elections = await db.transaction(async (transaction) => {
    await transaction
      .delete(votersTable)
      .where(eq(votersTable.electionId, electionId))

    await transaction
      .delete(ballotsTable)
      .where(eq(ballotsTable.electionId, electionId))

    return await transaction
      .update(electionsTable)
      .set({
        status: 'CREATED'
      })
      .where(eq(electionsTable.electionId, electionId))
      .returning()
  })

  return elections[0] || null
}
