import { db } from '~/db'
import { env } from '~/env'

export const findFinishedElection = async () => {
  // For building without database access
  // This generates empty pages and *.meta files need to be removed to generate them properly
  if (!env.DATABASE_URL) {
    return { election: null, ballots: [] }
  }

  const election = await db.query.electionsTable.findFirst({
    columns: {
      status: false
    },
    where: (electionsTable, { eq }) => eq(electionsTable.status, 'FINISHED'),
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
        orderBy: (ballotsTable) => ballotsTable.ballotId
      }
    }
  })

  if (!election) {
    return { election: null, ballots: [] }
  }

  const { ballots, ...electionWithoutVotes } = election
  return { election: electionWithoutVotes, ballots }
}

export type AuditPageProps = Awaited<ReturnType<typeof findFinishedElection>>
