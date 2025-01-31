import { TRPCError } from '@trpc/server'
import { createHash } from 'crypto'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { electionsTable, votersTable } from '../../db/schema'
import { adminProcedure } from '../../trpc/procedures/adminProcedure'
import { router } from '../../trpc/trpc'

export const adminVotersRouter = router({
  getAll: adminProcedure
    .input(
      z.object({
        electionId: z.string().uuid()
      })
    )
    .query(async ({ ctx, input }) => {
      const { electionId } = input
      const voters = await ctx.db.query.votersTable.findMany({
        columns: {
          voterId: true,
          email: true
        },
        with: {
          hasVoted: true
        },
        where: (votersTable, { eq }) => eq(votersTable.electionId, electionId)
      })
      return voters
    }),
  updateEmail: adminProcedure
    .input(
      z.object({
        oldEmail: z.string().min(1).email(),
        newEmail: z.string().min(1).email()
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { oldEmail, newEmail } = input
      const hashedOldEmail = createHash('sha256').update(oldEmail).digest('hex')
      const hashedNewEmail = createHash('sha256').update(newEmail).digest('hex')
      const voterElectionPairs = await ctx.db
        .update(votersTable)
        .set({ email: hashedNewEmail })
        .from(electionsTable)
        .where(eq(votersTable.email, hashedOldEmail))
        .returning({
          voter: {
            voterId: votersTable.voterId,
            email: votersTable.email
          },
          election: {
            electionId: electionsTable.electionId,
            title: electionsTable.title,
            description: electionsTable.description,
            seats: electionsTable.seats
          }
        })

      if (!voterElectionPairs[0]) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'voter_not_found'
        })
      }

      const to = [
        {
          email: newEmail,
          voterId: voterElectionPairs[0].voter.voterId
        }
      ]

      await ctx.emailService.sendVotingMail(to, {
        election: voterElectionPairs[0].election
      })
    })
})
