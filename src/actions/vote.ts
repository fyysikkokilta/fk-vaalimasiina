'use server'

import { revalidateTag } from 'next/cache'
import { z } from 'zod'

import { db } from '~/db'
import { ballotsTable, hasVotedTable, votesTable } from '~/db/schema'
import isUniqueConstraintError from '~/utils/isUniqueConstraintError'

const voteSchema = z.object({
  voterId: z
    .string({
      message: 'validation.voterId_string'
    })
    .uuid({
      message: 'validation.voterId_uuid'
    }),
  ballot: z
    .array(
      z.object(
        {
          candidateId: z
            .string({
              message: 'validation.candidateId_string'
            })
            .uuid({
              message: 'validation.candidateId_uuid'
            }),
          rank: z
            .number({
              message: 'validation.rank_number'
            })
            .min(1, { message: 'validation.rank_min' })
        },
        { message: 'validation.preference_object' }
      ),
      { message: 'validation.ballot_array' }
    )
    .refine(
      (ballot) => {
        const ranks = ballot.map((vote) => vote.rank)
        return (
          ranks.length === new Set(ranks).size &&
          ranks.every((rank, index) => rank === index + 1)
        )
      },
      { message: 'validation.ranks_unique' }
    )
})

export async function vote(
  voterId: string,
  _prevState: unknown,
  formData: FormData
) {
  const voteData = {
    voterId,
    ballot: formData.getAll('ballot').map((ballotItem) => {
      const [candidateId, rank] = (ballotItem as string).split(',')
      return { candidateId, rank: Number(rank) }
    })
  }
  const validatedVoteData = voteSchema.safeParse(voteData)

  if (!validatedVoteData.success) {
    return {
      success: false,
      message: 'invalid_ballot'
    }
  }

  const { ballot } = validatedVoteData.data
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
    return {
      success: false,
      message: 'voter_not_found'
    }
  }

  const election = validVoter.election
  const electionIsOnGoing = election.status === 'ONGOING'

  // Check if the election is ongoing
  if (!election || !electionIsOnGoing) {
    return {
      success: false,
      message: 'voting_not_ongoing'
    }
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
    return {
      success: false,
      message: 'invalid_choices'
    }
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
    revalidateTag(`voter-${voterId}`)
    return { success: true, message: 'ballot_saved', ballotId }
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        success: false,
        message: 'voter_already_voted'
      }
    }
    return {
      success: false,
      message: 'error_saving_ballot'
    }
  }
}
