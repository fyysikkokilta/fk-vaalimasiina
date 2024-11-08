import { db } from '../db'

export const getVoter = async (voterId: string) => {
  const voter = await db.query.votersTable.findFirst({
    where: (votersTable, { eq }) => eq(votersTable.voterId, voterId)
  })

  return voter || null
}
