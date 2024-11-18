import { relations } from 'drizzle-orm/relations'

import {
  ballotsTable,
  candidatesTable,
  electionsTable,
  votersTable,
  votesTable
} from './schema'

export const electionsRelations = relations(electionsTable, ({ many }) => ({
  candidates: many(candidatesTable),
  ballots: many(ballotsTable),
  voters: many(votersTable)
}))

export const votersRelations = relations(votersTable, ({ one }) => ({
  election: one(electionsTable, {
    fields: [votersTable.electionId],
    references: [electionsTable.electionId]
  })
}))

export const candidatesRelations = relations(
  candidatesTable,
  ({ one, many }) => ({
    election: one(electionsTable, {
      fields: [candidatesTable.electionId],
      references: [electionsTable.electionId]
    }),
    votes: many(votesTable)
  })
)

export const ballotsRelations = relations(ballotsTable, ({ one, many }) => ({
  election: one(electionsTable, {
    fields: [ballotsTable.electionId],
    references: [electionsTable.electionId]
  }),
  votes: many(votesTable)
}))

export const votesRelations = relations(votesTable, ({ one }) => ({
  ballot: one(ballotsTable, {
    fields: [votesTable.ballotId],
    references: [ballotsTable.ballotId]
  }),
  candidate: one(candidatesTable, {
    fields: [votesTable.candidateId],
    references: [candidatesTable.candidateId]
  })
}))
