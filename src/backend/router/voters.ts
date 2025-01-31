import { TRPCError } from '@trpc/server'
import { sql } from 'drizzle-orm'
import { z } from 'zod'

import { publicProcedure } from '../trpc/procedures/publicProcedure'
import { router } from '../trpc/trpc'

export const votersRouter = router({
  getWithId: publicProcedure
    .input(
      z.object({
        voterId: z.string().uuid()
      })
    )
    .query(async ({ ctx, input }) => {
      const { voterId } = input
      const voter = await ctx.db.query.votersTable.findFirst({
        columns: {
          electionId: true,
          voterId: true,
          email: true
        },
        where: (votersTable, { eq }) => eq(votersTable.voterId, voterId),
        with: {
          election: {
            with: {
              candidates: {
                columns: {
                  candidateId: true,
                  name: true
                }
              }
            }
          }
        },
        extras: {
          hasVoted:
            sql<boolean>`EXISTS (SELECT 1 FROM has_voted WHERE has_voted.voter_id = ${voterId})`.as(
              'has_voted'
            )
        }
      })
      if (!voter) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'voter_not_found'
        })
      }
      const { election, ...voterWithoutElections } = voter
      return { voter: voterWithoutElections, election }
    })
})
