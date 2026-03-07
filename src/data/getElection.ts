import { cache } from 'react'

import { db } from '~/db'
import { env } from '~/env'

export const getElection = cache(async (electionId: string) => {
  // For building without database access
  // This generates empty pages and *.meta files need to be removed to generate them properly
  if (!env.DATABASE_URL) {
    return null
  }

  const election = await db.query.elections.findFirst({
    columns: {
      status: false
    },
    where: {
      electionId,
      status: 'CLOSED'
    },
    with: {
      candidates: {
        columns: {
          candidateId: true,
          name: true
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
        orderBy: {
          ballotId: 'asc'
        }
      },
      voters: {
        columns: {
          voterId: true
        }
      }
    }
  })

  if (!election) {
    return null
  }

  const { ballots, ...electionWithoutVotes } = election
  const voterCount = election.voters.length
  const electionWithoutVoters = {
    ...electionWithoutVotes,
    voters: undefined
  }
  return { election: electionWithoutVoters, ballots, voterCount }
})

export type ElectionPageProps = NonNullable<
  Awaited<ReturnType<typeof getElection>>
>
