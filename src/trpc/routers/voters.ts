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
        columns: {},
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
          },
          hasVoted: {
            columns: {
              hasVotedId: true
            }
          }
        }
      })
      if (!voter) {
        return null
      }
      const { election, ...voterWithoutElections } = voter
      return { voter: voterWithoutElections, election }
    })
})
