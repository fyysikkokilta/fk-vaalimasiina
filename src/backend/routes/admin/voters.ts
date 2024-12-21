import { createHash } from 'node:crypto'

import { eq } from 'drizzle-orm'

import { db } from '../../db'
import { electionsTable, votersTable } from '../../db/schema'
import EmailService from '../../emails/handler'

export const changeVoterEmail = async (oldEmail: string, newEmail: string) => {
  const hashedOldEmail = createHash('sha256').update(oldEmail).digest('hex')
  const hashedNewEmail = createHash('sha256').update(newEmail).digest('hex')
  const voterElectionPairs = await db
    .update(votersTable)
    .set({ email: hashedNewEmail })
    .from(electionsTable)
    .where(eq(votersTable.email, hashedOldEmail))
    .returning({
      voter: {
        voterId: votersTable.voterId,
        email: votersTable.email,
        hasVoted: votersTable.hasVoted
      },
      election: {
        electionId: electionsTable.electionId,
        title: electionsTable.title,
        description: electionsTable.description,
        seats: electionsTable.seats
      }
    })

  if (!voterElectionPairs[0]) {
    return null
  }

  const to = [
    {
      email: newEmail,
      voterId: voterElectionPairs[0].voter.voterId
    }
  ]

  await EmailService.sendVotingMail(to, {
    election: voterElectionPairs[0].election
  })

  return voterElectionPairs[0].voter
}

export const getVoters = async (electionId: string) => {
  return db.query.votersTable.findMany({
    columns: {
      voterId: true,
      email: true,
      hasVoted: true
    },
    where: (votersTable, { eq }) => eq(votersTable.electionId, electionId)
  })
}

export const checkIfEveryoneVoted = async (electionId: string) => {
  const voters = await db.query.votersTable.findMany({
    columns: {
      hasVoted: true
    },
    where: (votersTable, { eq }) => eq(votersTable.electionId, electionId)
  })

  return voters.every((voter) => voter.hasVoted)
}
