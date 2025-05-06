'use server'

import { revalidatePath } from 'next/cache'
import { getTranslations } from 'next-intl/server'
import { z } from 'zod'

import { getDb } from '~/db'
import { ballotsTable, hasVotedTable, votesTable } from '~/db/schema'
import { routing } from '~/i18n/routing'
import isUniqueConstraintError from '~/utils/isUniqueConstraintError'

import { actionClient, ActionError } from './safe-action'

const voteSchema = async () => {
  const t = await getTranslations('actions.vote.validation')
  return z.object({
    voterId: z
      .string({
        message: t('voterId_string')
      })
      .uuid({
        message: t('voterId_uuid')
      }),
    ballot: z
      .array(
        z.object(
          {
            candidateId: z
              .string({
                message: t('candidateId_string')
              })
              .uuid({
                message: t('candidateId_uuid')
              }),
            rank: z
              .number({
                message: t('rank_number')
              })
              .min(1, { message: t('rank_min') })
          },
          { message: t('preference_object') }
        ),
        { message: t('ballot_array') }
      )
      .refine(
        (ballot) => {
          const ranks = ballot.map((vote) => vote.rank)
          return (
            ranks.length === new Set(ranks).size &&
            ranks.every((rank, index) => rank === index + 1)
          )
        },
        { message: t('ranks_unique') }
      )
  })
}

export const vote = actionClient
  .schema(voteSchema)
  .action(async ({ parsedInput: { voterId, ballot } }) => {
    const t = await getTranslations('actions.vote.action_status')
    const validVoter = await getDb().query.votersTable.findFirst({
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
      throw new ActionError(t('voter_not_found'))
    }

    const election = validVoter.election
    const electionIsOnGoing = election.status === 'ONGOING'

    // Check if the election is ongoing
    if (!election || !electionIsOnGoing) {
      throw new ActionError(t('voting_not_ongoing'))
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
      throw new ActionError(t('invalid_choices'))
    }

    try {
      const ballotId = await getDb().transaction(async (transaction) => {
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
      return { message: t('ballot_saved'), ballotId }
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new ActionError(t('voter_already_voted'))
      }
      throw new ActionError(t('error_saving_ballot'))
    }
  })
