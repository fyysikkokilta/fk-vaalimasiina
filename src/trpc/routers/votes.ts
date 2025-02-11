import { TRPCError } from '@trpc/server'
import { z } from 'zod'

import { ballotsTable, hasVotedTable, votesTable } from '~/db/schema'
import isUniqueConstraintError from '~/utils/isUniqueConstraintError'

import { router } from '../init'
import { publicProcedure } from '../procedures/publicProcedure'

export const votesRouter = router({
  post: publicProcedure
    .input(
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
    .mutation(async ({ ctx, input }) => {
      const { voterId, ballot } = input

      const validVoter = await ctx.db.query.votersTable.findFirst({
        where: (votersTable, { eq }) => eq(votersTable.voterId, voterId),
        with: {
          election: {
            with: {
              candidates: true
            }
          },
          hasVoted: true
        }
      })

      if (!validVoter) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'voter_not_found'
        })
      }

      const election = validVoter.election
      const electionIsOnGoing = election.status === 'ONGOING'

      // Check if the election is ongoing
      if (!election || !electionIsOnGoing) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'voting_not_ongoing'
        })
      }

      // Check that every candidate in the ballot is a valid candidate
      const validCandidates = ballot.every((ballotItem) =>
        election.candidates.some(
          (candidate) =>
            candidate.candidateId === ballotItem.candidateId &&
            candidate.electionId === election.electionId
        )
      )

      // Check that preference numbers are unique and start from 1 and increment by 1
      const preferenceNumbers = ballot.map((vote) => vote.preferenceNumber)
      const validPreferenceNumbers =
        preferenceNumbers.length === new Set(preferenceNumbers).size &&
        preferenceNumbers.every(
          (preferenceNumber, index) => preferenceNumber === index + 1
        )

      const validBallot = validCandidates && validPreferenceNumbers

      if (!validBallot) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'invalid_ballot'
        })
      }

      try {
        const ballotId = await ctx.db.transaction(async (transaction) => {
          const ballots = await transaction
            .insert(ballotsTable)
            .values({ electionId: election.electionId })
            .returning({ ballotId: ballotsTable.ballotId })

          if (ballot.length > 0) {
            await transaction.insert(votesTable).values(
              ballot.map((vote) => ({
                ballotId: ballots[0].ballotId,
                candidateId: vote.candidateId,
                preferenceNumber: vote.preferenceNumber
              }))
            )
          }

          // Don't allow the same voter to vote twice
          // Duplicate votes are handled by the database schema
          // If duplicate votes are attempted, the database will throw an error
          await transaction.insert(hasVotedTable).values({ voterId })

          return ballots[0].ballotId
        })
        return { ballotId }
      } catch (error) {
        if (isUniqueConstraintError(error)) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'voter_already_voted'
          })
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'error_saving_ballot'
        })
      }
    })
})
