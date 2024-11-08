import { db } from '../db'

export const getVotes = async (electionId: string) => {
  return db.query.ballotsTable.findMany({
    with: {
      votes: true
    },
    where: (ballotsTable, { eq }) => eq(ballotsTable.electionId, electionId)
  })
}
