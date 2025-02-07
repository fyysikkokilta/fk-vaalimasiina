import { sql } from 'drizzle-orm'
import { z } from 'zod'

import { router } from '../init'
import { publicProcedure } from '../procedures/publicProcedure'

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
        return null
      }
      const { election, ...voterWithoutElections } = voter
      return { voter: voterWithoutElections, election }
    })
})
