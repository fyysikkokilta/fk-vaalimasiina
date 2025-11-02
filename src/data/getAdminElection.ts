import { cache } from 'react'

import { db } from '~/db'
import { env } from '~/env'

export const getAdminElection = cache(async () => {
  // For building without database access
  // This generates empty pages and *.meta files need to be removed to generate them properly
  if (!env.DATABASE_URL) {
    return null
  }

  const elections = await db.query.electionsTable.findMany({
    where: (electionsTable, { eq, not }) =>
      not(eq(electionsTable.status, 'CLOSED')),
    with: {
      candidates: {
        columns: {
          candidateId: true,
          name: true
        }
      },
      voters: {
        columns: {},
        with: {
          hasVoted: {
            columns: {
              hasVotedId: true
            }
          }
        }
      },
      ballots: {
        columns: {},
        with: {
          votes: {
            columns: {
              candidateId: true,
              rank: true
            }
          }
        },
        // BallotId is random, so this makes the order not the same as order of creation
        orderBy: (ballotsTable) => ballotsTable.ballotId
      }
    }
  })

  if (elections.length === 0) {
    return null
  }

  const { voters, ballots, ...election } = elections[0]

  return {
    election,
    voters,
    ballots
  }
})

export type AdminElection = Awaited<ReturnType<typeof getAdminElection>>

export type ElectionStepProps = NonNullable<AdminElection>
