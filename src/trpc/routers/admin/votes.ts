import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { router } from '../../init'
import { adminProcedure } from '../../procedures/adminProcedure'

export const adminVotesRouter = router({
  getWithId: adminProcedure
    .input(
      z.object({
        electionId: z.string().uuid()
      })
    )
    .query(async ({ ctx, input }) => {
      const { electionId } = input
      const election = await ctx.db.query.electionsTable.findFirst({
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
            columns: {
              ballotId: true
            },
            with: {
              votes: {
                columns: {
                  candidateId: true,
                  preferenceNumber: true
                }
              }
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
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'election_not_found'
        })
      }

      if (election.status !== 'FINISHED' && election.status !== 'CLOSED') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'election_not_completed'
        })
      }
      return { ballots: election.ballots, voterCount: election.voters.length }
    })
})
