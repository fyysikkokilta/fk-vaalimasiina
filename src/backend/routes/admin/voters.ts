import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { votersTable } from '../../db/schema'
import EmailService from '../../emails/handler'
import { getElection } from './elections'

export const changeVoterEmail = async (voterId: string, email: string) => {
  const voters = await db
    .update(votersTable)
    .set({ email })
    .where(eq(votersTable.voterId, voterId))
    .returning()

  if (!voters[0]) {
    return null
  }

  const election = await getElection(voters[0].electionId)

  await EmailService.sendVotingMail(email, {
    election: election!,
    voterId: voters[0].voterId
  })

  return voters[0]
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
