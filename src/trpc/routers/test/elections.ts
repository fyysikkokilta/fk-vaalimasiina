import { eq } from 'drizzle-orm'
import { revalidateTag } from 'next/cache'
import { z } from 'zod'

import { candidatesTable, electionsTable } from '~/db/schema'

import { router } from '../../init'
import { testProcedure } from '../../procedures/testProcedure'

export const testElectionsRouter = router({
  create: testProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        seats: z.number().min(1),
        candidates: z.array(z.object({ name: z.string().min(1) })).min(1),
        status: z.union([
          z.literal('CREATED'),
          z.literal('UPDATING'),
          z.literal('ONGOING'),
          z.literal('FINISHED'),
          z.literal('CLOSED')
        ])
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { title, description, seats, candidates, status } = input
      const election = ctx.db.transaction(async (transaction) => {
        const elections = await transaction
          .insert(electionsTable)
          .values([
            {
              title,
              description,
              seats,
              status
            }
          ])
          .returning()

        const insertedCandidates = await transaction
          .insert(candidatesTable)
          .values(
            candidates.map((candidate) => ({
              electionId: elections[0].electionId,
              name: candidate.name
            }))
          )
          .returning()

        return { ...elections[0], candidates: insertedCandidates }
      })
      return election
    }),
  changeStatus: testProcedure
    .input(
      z.object({
        electionId: z.string().uuid(),
        status: z.union([
          z.literal('CREATED'),
          z.literal('UPDATING'),
          z.literal('ONGOING'),
          z.literal('FINISHED'),
          z.literal('CLOSED')
        ])
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { electionId, status } = input
      const election = await ctx.db
        .update(electionsTable)
        .set({
          status
        })
        .where(eq(electionsTable.electionId, electionId))
        .returning()

      revalidateTag('auditable-election')
      revalidateTag('elections')
      return election[0]
    })
})
