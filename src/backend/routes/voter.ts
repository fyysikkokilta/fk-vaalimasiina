import { db } from '../db'

export const getVoter = async (voterId: string) => {
  const voter = await db.query.votersTable.findFirst({
    where: (votersTable, { eq }) => eq(votersTable.voterId, voterId)
  })

  return voter || null
}

export const getVoterWithElection = async (voterId: string) => {
  const voter = await db.query.votersTable.findFirst({
    where: (votersTable, { eq }) => eq(votersTable.voterId, voterId),
    with: {
      election: {
        with: {
          candidates: true
        }
      }
    }
  })

  return voter || null
}
