import { z } from 'zod'

import { ballotsTable, hasVotedTable, votesTable } from '~/db/schema'

import { router } from '../../init'
import { testProcedure } from '../../procedures/testProcedure'

export const testVotesRouter = router({
  create: testProcedure
    .input(
      z.object({
        electionId: z.string().uuid(),
        voterIdBallotPairs: z.array(
          z.object({
            voterId: z.string().uuid(),
            ballot: z.array(
              z.object({
                candidateId: z.string().uuid(),
                rank: z.number().min(1)
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
                  rank: vote.rank
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
