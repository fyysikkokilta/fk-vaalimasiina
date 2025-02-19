import { z } from 'zod'

import { router } from '../init'
import { publicProcedure } from '../procedures/publicProcedure'

export const electionsRouter = router({
  getAllClosed: publicProcedure.query(async ({ ctx }) => {
    const elections = await ctx.db.query.electionsTable.findMany({
      where: (electionsTable, { eq }) => eq(electionsTable.status, 'CLOSED')
    })
    return elections
  }),
  findFinished: publicProcedure.query(async ({ ctx }) => {
    const election = await ctx.db.query.electionsTable.findFirst({
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
          orderBy: (_ballotsTable, { sql }) => sql`RANDOM()` // Randomize the order
        }
      }
    })

    if (!election) {
      return { election: null, ballots: [] }
    }

    const { ballots, ...electionWithoutVotes } = election
    return { election: electionWithoutVotes, ballots }
  }),
  getCompletedWithId: publicProcedure
    .input(z.object({ electionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { electionId } = input
      const election = await ctx.db.query.electionsTable.findFirst({
        columns: {
          status: false
        },
        where: (electionsTable, { and, or, eq }) =>
          and(
            eq(electionsTable.electionId, electionId),
            or(
              eq(electionsTable.status, 'FINISHED'),
              eq(electionsTable.status, 'CLOSED')
            )
          ),
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
            orderBy: (_ballotsTable, { sql }) => sql`RANDOM()` // Randomize the order
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
})
