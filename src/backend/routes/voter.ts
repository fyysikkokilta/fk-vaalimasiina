import { db } from '../db'

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
