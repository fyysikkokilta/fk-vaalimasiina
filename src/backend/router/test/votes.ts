import { z } from 'zod'

import { ballotsTable, hasVotedTable, votesTable } from '../../db/schema'
import { publicProcedure } from '../../trpc/procedures/publicProcedure'
import { router } from '../../trpc/trpc'

export const testVotesRouter = router({
  create: publicProcedure
    .input(
      z.object({
        electionId: z.string().uuid(),
        voterIdBallotPairs: z.array(
          z.object({
            voterId: z.string().uuid(),
            ballot: z.array(
              z.object({
                candidateId: z.string().uuid(),
                preferenceNumber: z.number().min(1)
              })
            )
          })
        )
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { electionId, voterIdBallotPairs } = input
      return ctx.db.transaction(async (transaction) => {
        const ballots = await transaction
          .insert(ballotsTable)
          .values(
            voterIdBallotPairs.map(() => ({
              electionId
            }))
          )
          .returning()

        const votes = await transaction
          .insert(votesTable)
          .values(
            ballots
              .map((ballot, index) =>
                voterIdBallotPairs[index].ballot.map((vote) => ({
                  ballotId: ballot.ballotId,
                  candidateId: vote.candidateId,
                  preferenceNumber: vote.preferenceNumber
                }))
              )
              .flat()
          )
          .returning()

        await transaction.insert(hasVotedTable).values(
          voterIdBallotPairs.map(({ voterId }) => ({
            voterId
          }))
        )

        return ballots.map((ballot) => ({
          ...ballot,
          votes: votes.filter((vote) => vote.ballotId === ballot.ballotId)
        }))
      })
    })
})
