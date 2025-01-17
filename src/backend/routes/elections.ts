import { or } from 'drizzle-orm'

import { db } from '../db'

export const getElections = async () => {
  return db.query.electionsTable.findMany({
    with: {
      candidates: true
    }
  })
}

export const findFinishedElectionWithVotes = async () => {
  const election = await db.query.electionsTable.findFirst({
    where: (electionsTable, { eq }) => eq(electionsTable.status, 'FINISHED'),
    with: {
      candidates: true,
      ballots: {
        with: {
          votes: true
        },
        orderBy: (_ballotsTable, { sql }) => sql`RANDOM()` // Randomize the order
      }
    }
  })

  return election || null
}

export const getCompletedElectionWithVotes = async (electionId: string) => {
  const election = await db.query.electionsTable.findFirst({
    where: (electionsTable, { and, eq }) =>
      and(
        eq(electionsTable.electionId, electionId),
        or(
          eq(electionsTable.status, 'FINISHED'),
          eq(electionsTable.status, 'CLOSED')
        )
      ),
    with: {
      candidates: true,
      ballots: {
        with: {
          votes: true
        },
        orderBy: (_ballotsTable, { sql }) => sql`RANDOM()` // Randomize the order
      },
      voters: {
        columns: {
          email: true
        }
      }
    }
  })

  if (!election) {
    return null
  }

  const { voters, ...electionWithoutVoters } = election

  return {
    ...electionWithoutVoters,
    voterCount: voters.length
  }
}
