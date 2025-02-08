import { createHash } from 'node:crypto'

import { TRPCError } from '@trpc/server'
import { eq, sql } from 'drizzle-orm'
import { z } from 'zod'

import {
  ballotsTable,
  candidatesTable,
  electionsTable,
  votersTable
} from '~/db/schema'
import { sendVotingMail } from '~/emails/handler'

import { router } from '../../init'
import { adminProcedure } from '../../procedures/adminProcedure'

export const adminElectionsRouter = router({
  findCurrent: adminProcedure.query(async ({ ctx }) => {
    const elections = await ctx.db.query.electionsTable.findMany({
      where: (electionsTable, { eq, not }) =>
        not(eq(electionsTable.status, 'CLOSED')),
      with: {
        candidates: {
          columns: {
            candidateId: true,
            name: true
          }
        },
        voters: {
          columns: {},
          with: {
            hasVoted: {
              columns: {
                hasVotedId: true
              }
            }
          }
        },
        ballots: {
          columns: {},
          with: {
            votes: {
              columns: {
                candidateId: true,
                preferenceNumber: true
              }
            }
          }
        }
      }
    })

    if (elections.length === 0) {
      return null
    }

    if (elections.length > 1) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'multiple_non_closed_elections'
      })
    }

    return elections[0]
  }),
  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        seats: z.number().min(1),
        candidates: z.array(z.object({ name: z.string().min(1) })).min(1)
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { title, description, seats, candidates } = input
      return ctx.db.transaction(async (transaction) => {
        const elections = await transaction
          .insert(electionsTable)
          .values([
            {
              title,
              description,
              seats
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
          .returning({
            candidateId: candidatesTable.candidateId,
            name: candidatesTable.name
          })

        return { ...elections[0], candidates: insertedCandidates }
      })
    }),
  update: adminProcedure
    .input(
      z.object({
        electionId: z.string().uuid(),
        title: z.string().min(1),
        description: z.string().min(1),
        seats: z.number().min(1),
        candidates: z.array(z.object({ name: z.string().min(1) })).min(1)
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { electionId, title, description, seats, candidates } = input
      const election = await ctx.db.transaction(async (transaction) => {
        const elections = await transaction
          .update(electionsTable)
          .set({
            title,
            description,
            seats
          })
          .where(eq(electionsTable.electionId, electionId))
          .returning()

        if (!elections[0]) {
          return null
        }

        await transaction
          .delete(candidatesTable)
          .where(eq(candidatesTable.electionId, electionId))

        const insertedCandidates = await transaction
          .insert(candidatesTable)
          .values(
            candidates.map((candidate) => ({
              electionId,
              name: candidate.name
            }))
          )
          .returning({
            candidateId: candidatesTable.candidateId,
            name: candidatesTable.name
          })

        return { ...elections[0], candidates: insertedCandidates }
      })

      if (!election) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'election_not_found'
        })
      }

      return election
    }),
  startVoting: adminProcedure
    .input(
      z.object({
        electionId: z.string().uuid(),
        emails: z.array(z.string().min(1).email()).min(1)
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { electionId, emails } = input
      const [election, insertedVoters] = await ctx.db.transaction(
        async (transaction) => {
          const elections = await transaction
            .update(electionsTable)
            .set({
              status: 'ONGOING'
            })
            .where(eq(electionsTable.electionId, electionId))
            .returning({
              title: electionsTable.title,
              description: electionsTable.description,
              seats: electionsTable.seats,
              status: electionsTable.status
            })

          if (!elections[0]) {
            return [null, []]
          }

          const emailsData = emails.map((email) => ({
            email,
            hash: createHash('sha256').update(email).digest('hex')
          }))

          const insertedVoters = await transaction
            .insert(votersTable)
            .values(
              emailsData.map((email) => ({
                electionId,
                email: email.hash
              }))
            )
            .returning()

          const voters = insertedVoters.map((voter) => ({
            email: emailsData.find((email) => email.hash === voter.email)!
              .email,
            voterId: voter.voterId
          }))

          return [elections[0], voters]
        }
      )

      if (!election) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'election_not_found'
        })
      }

      await sendVotingMail(insertedVoters, { election })

      return { status: election.status }
    }),
  endVoting: adminProcedure
    .input(z.object({ electionId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { electionId } = input

      const voters = await ctx.db.query.votersTable.findMany({
        with: {
          hasVoted: true
        },
        where: (votersTable, { eq }) => eq(votersTable.electionId, electionId)
      })

      const everyoneVoted = voters.every((voter) => voter.hasVoted)

      if (!everyoneVoted) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'not_everyone_voted'
        })
      }

      const status = await ctx.db.transaction(async (transaction) => {
        const statuses = await transaction
          .update(electionsTable)
          .set({
            status: 'FINISHED'
          })
          .where(eq(electionsTable.electionId, electionId))
          .returning({
            status: electionsTable.status
          })

        const status = statuses[0]

        if (!status) {
          return null
        }

        await transaction
          .update(votersTable)
          .set({
            email: sql`encode(sha256(concat('', gen_random_uuid())::bytea), 'hex')`
          })
          .where(eq(votersTable.electionId, electionId))

        return status
      })

      if (!status) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'election_not_found'
        })
      }

      return status
    }),
  close: adminProcedure
    .input(z.object({ electionId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { electionId } = input
      const statuses = await ctx.db
        .update(electionsTable)
        .set({
          status: 'CLOSED'
        })
        .where(eq(electionsTable.electionId, electionId))
        .returning({
          status: electionsTable.status
        })

      if (!statuses[0]) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'election_not_found'
        })
      }

      return statuses[0]
    }),
  abortVoting: adminProcedure
    .input(z.object({ electionId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { electionId } = input
      const statuses = await ctx.db.transaction(async (transaction) => {
        await transaction
          .delete(votersTable)
          .where(eq(votersTable.electionId, electionId))

        await transaction
          .delete(ballotsTable)
          .where(eq(ballotsTable.electionId, electionId))

        return await transaction
          .update(electionsTable)
          .set({
            status: 'CREATED'
          })
          .where(eq(electionsTable.electionId, electionId))
          .returning({
            status: electionsTable.status
          })
      })

      if (!statuses[0]) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'election_not_found'
        })
      }

      return statuses[0]
    })
})
