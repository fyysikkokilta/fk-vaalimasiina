import { eq } from 'drizzle-orm'

import { db } from '../../db'
import { electionsTable, votersTable } from '../../db/schema'
import EmailService from '../../emails/handler'

export const changeVoterEmail = async (voterId: string, email: string) => {
  const voterElectionPairs = await db
    .update(votersTable)
    .set({ email })
    .from(electionsTable)
    .where(eq(votersTable.voterId, voterId))
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

  const to = voterElectionPairs.map((pair) => ({
    email: pair.voter.email,
    voterId: pair.voter.voterId
  }))

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
