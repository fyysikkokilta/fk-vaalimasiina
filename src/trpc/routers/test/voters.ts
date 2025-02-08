import { createHash } from 'node:crypto'

import { z } from 'zod'

import { votersTable } from '~/db/schema'

import { router } from '../../init'
import { testProcedure } from '../../procedures/testProcedure'

export const testVotersRouter = router({
  create: testProcedure
    .input(
      z.object({
        electionId: z.string().uuid(),
        emails: z.array(z.string().email())
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { electionId, emails } = input
      return ctx.db
        .insert(votersTable)
        .values(
          emails.map((email) => ({
            electionId,
            email: createHash('sha256').update(email).digest('hex')
          }))
        )
        .returning()
    })
})
