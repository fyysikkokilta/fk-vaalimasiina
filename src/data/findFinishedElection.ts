import { cache } from 'react'

import { db } from '~/db'
import { env } from '~/env'

export const findFinishedElection = cache(async () => {
  // For building without database access
  // This generates empty pages and *.meta files need to be removed to generate them properly
  if (!env.DATABASE_URL) {
    return { election: null, ballots: [] }
  }

  const election = await db.query.elections.findFirst({
    columns: {
      status: false
    },
    where: {
      status: 'FINISHED'
    },
    with: {
      candidates: {
        columns: {
          candidateId: true,
          name: true
        }
      },
      ballots: {
        columns: {
          ballotId: true
        },
        with: {
          votes: {
            columns: {
              candidateId: true,
              rank: true
            }
          }
        },
        // BallotId is random, so this makes the order not the same as order of creation
        orderBy: {
          ballotId: 'asc'
        }
      }
    }
  })

  if (!election) {
    return { election: null, ballots: [] }
  }

  const { ballots, ...electionWithoutVotes } = election
  return { election: electionWithoutVotes, ballots }
})

export type AuditPageProps = Awaited<ReturnType<typeof findFinishedElection>>
