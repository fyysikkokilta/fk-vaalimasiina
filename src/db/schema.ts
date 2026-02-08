import { sql } from 'drizzle-orm'
import {
  check,
  integer,
  pgEnum,
  pgTable,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  varchar
} from 'drizzle-orm/pg-core'

export const statusEnum = pgEnum('election_status', [
  'CREATED',
  'UPDATING',
  'ONGOING',
  'FINISHED',
  'CLOSED'
])

export const votingMethodEnum = pgEnum('voting_method', ['STV', 'MAJORITY'])

export const electionsTable = pgTable(
  'elections',
  {
    electionId: uuid('election_id').primaryKey().notNull().defaultRandom(),
    title: varchar('title').notNull(),
    description: varchar('description').notNull(),
    seats: integer('seats').notNull(),
    status: statusEnum('status').notNull().default('CREATED'),
    votingMethod: votingMethodEnum('voting_method').notNull().default('STV'),
    date: timestamp('date').notNull().defaultNow(),
    csvFilePath: varchar('csv_file_path')
  },
  (table) => [
    uniqueIndex('unique_active_election')
      .on(sql`(TRUE)`)
      .where(sql`${table.status} <> 'CLOSED'`),
    check('check_elections_seats', sql`${table.seats} > 0`)
  ]
)

export const votersTable = pgTable(
  'voters',
  {
    voterId: uuid('voter_id').primaryKey().notNull().defaultRandom(),
    electionId: uuid('election_id')
      .notNull()
      .references(() => electionsTable.electionId, {
        onDelete: 'cascade'
      }),
    email: varchar('email').notNull()
  },
  (table) => [
    uniqueIndex('unique_voters_electionId_email').on(table.electionId, sql`lower(${table.email})`)
  ]
)

export const hasVotedTable = pgTable(
  'has_voted',
  {
    hasVotedId: uuid('has_voted_id').primaryKey().notNull().defaultRandom(),
    voterId: uuid('voter_id')
      .notNull()
      .references(() => votersTable.voterId, {
        onDelete: 'cascade'
      })
  },
  (table) => [unique('unique_voters_voterId').on(table.voterId)]
)

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
    rank: integer('rank').notNull()
  },
  (table) => [
    unique('unique_votes_ballotId_rank').on(table.ballotId, table.rank),
    unique('unique_votes_ballotId_candidateId').on(table.ballotId, table.candidateId),
    check('check_votes_rank', sql`${table.rank} > 0`)
  ]
)
