'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { actionClient, ActionError } from '~/actions/safe-action'
import { db } from '~/db'
import { ballotsTable, hasVotedTable, votesTable } from '~/db/schema'
import { routing } from '~/i18n/routing'
import { isPgUniqueViolation } from '~/utils/dbErrors'

const voteSchema = z.object({
  voterId: z.uuid('Voter identifier must be a valid UUID'),
  ballot: z
    .array(
      z.object({
        candidateId: z.uuid('Candidate identifier must be a valid UUID'),
        rank: z.number('Rank must be a number').min(1, 'Rank must be at least 1')
      }),
      'Ballot must be an array'
    )
    .refine((ballot) => {
      const ranks = ballot.map((vote) => vote.rank)
      return (
        ranks.length === new Set(ranks).size && ranks.every((rank, index) => rank === index + 1)
      )
    }, 'Ranks must be unique')
})

export const vote = actionClient
  .inputSchema(voteSchema)
  .action(async ({ parsedInput: { voterId, ballot } }) => {
    const validVoter = await db.query.votersTable.findFirst({
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
      throw new ActionError('Voter not found')
    }

    const election = validVoter.election
    const electionIsOnGoing = election.status === 'ONGOING'

    // Check if the election is ongoing
    if (!election || !electionIsOnGoing) {
      throw new ActionError('Voting is not ongoing')
    }

    // Check that every candidate in the ballot is a valid candidate
    const validCandidates = ballot.every((ballotItem) =>
      election.candidates.some(
        (candidate) =>
          candidate.candidateId === ballotItem.candidateId &&
          candidate.electionId === election.electionId
      )
    )

    if (!validCandidates) {
      throw new ActionError('Invalid choices')
    }

    try {
      const ballotId = await db.transaction(async (transaction) => {
        const ballots = await transaction
          .insert(ballotsTable)
          .values({ electionId: election.electionId })
          .returning({ ballotId: ballotsTable.ballotId })

        if (ballot.length > 0) {
          await transaction.insert(votesTable).values(
            ballot.map((vote) => ({
              ballotId: ballots[0].ballotId,
              candidateId: vote.candidateId,
              rank: vote.rank
            }))
          )
        }

        // Don't allow the same voter to vote twice
        // Duplicate votes are handled by the database schema
        // If duplicate votes are attempted, the database will throw an error
        await transaction.insert(hasVotedTable).values({ voterId })

        return ballots[0].ballotId
      })
      routing.locales.forEach((locale) => {
        revalidatePath(`/${locale}/vote/${voterId}`)
      })
      return { message: 'Your vote has been saved', ballotId }
    } catch (error) {
      if (isPgUniqueViolation(error)) {
        throw new ActionError('Voter has already voted')
      }
      throw new ActionError('Error saving ballot')
    }
  })
