import { SQL, sql } from 'drizzle-orm'
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  uuid,
  varchar,
  unique,
  AnyPgColumn,
  uniqueIndex
} from 'drizzle-orm/pg-core'

export const statusEnum = pgEnum('election_status', [
  'CREATED',
  'ONGOING',
  'FINISHED',
  'CLOSED'
])

export const electionsTable = pgTable('elections', {
  electionId: uuid('election_id').primaryKey().notNull().defaultRandom(),
  title: varchar('title').notNull(),
  description: varchar('description').notNull(),
  seats: integer('seats').notNull(),
  status: statusEnum('status').notNull().default('CREATED')
})

export const votersTable = pgTable(
  'voters',
  {
    voterId: uuid('voter_id').primaryKey().notNull().defaultRandom(),
    electionId: uuid('election_id')
      .notNull()
      .references(() => electionsTable.electionId, {
        onDelete: 'cascade'
      }),
    email: varchar('email').notNull(),
    hasVoted: boolean('has_voted').notNull().default(false)
  },
  (table) => [
    uniqueIndex('unique_voters_electionId_email').on(
      table.electionId,
      lower(table.email)
    )
  ]
)

export function lower(email: AnyPgColumn): SQL {
  return sql`lower(${email})`
}

export const candidatesTable = pgTable('candidates', {
  candidateId: uuid('candidate_id').primaryKey().notNull().defaultRandom(),
  electionId: uuid('election_id')
    .notNull()
    .references(() => electionsTable.electionId, {
      onDelete: 'cascade'
    }),
  name: varchar('name').notNull()
})

export const ballotsTable = pgTable('ballots', {
  ballotId: uuid('ballot_id').primaryKey().notNull().defaultRandom(),
  electionId: uuid('election_id')
    .notNull()
    .references(() => electionsTable.electionId, {
      onDelete: 'cascade'
    })
})

export const votesTable = pgTable(
  'votes',
  {
    voteId: uuid('vote_id').primaryKey().notNull().defaultRandom(),
    ballotId: uuid('ballot_id')
      .notNull()
      .references(() => ballotsTable.ballotId, {
        onDelete: 'cascade'
      }),
    candidateId: uuid('candidate_id')
      .notNull()
      .references(() => candidatesTable.candidateId, {
        onDelete: 'cascade'
      }),
    preferenceNumber: integer('preference_number').notNull()
  },
  (table) => [
    unique('unique_votes_ballotId_preferenceNumber').on(
      table.ballotId,
      table.preferenceNumber
    ),
    unique('unique_votes_ballotId_candidateId').on(
      table.ballotId,
      table.candidateId
    )
  ]
)
