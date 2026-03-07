import {
  pgEnum,
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  uniqueIndex,
  unique,
  check
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

export const electionStatus = pgEnum('election_status', [
  'CREATED',
  'UPDATING',
  'ONGOING',
  'FINISHED',
  'CLOSED'
])
export const votingMethod = pgEnum('voting_method', ['STV', 'MAJORITY'])

export const ballots = pgTable('ballots', {
  ballotId: uuid('ballot_id').defaultRandom().primaryKey(),
  electionId: uuid('election_id')
    .notNull()
    .references(() => elections.electionId, { onDelete: 'cascade' })
})

export const candidates = pgTable('candidates', {
  candidateId: uuid('candidate_id').defaultRandom().primaryKey(),
  electionId: uuid('election_id')
    .notNull()
    .references(() => elections.electionId, { onDelete: 'cascade' }),
  name: varchar('name').notNull()
})

export const elections = pgTable(
  'elections',
  {
    electionId: uuid('election_id').defaultRandom().primaryKey(),
    title: varchar('title').notNull(),
    description: varchar('description').notNull(),
    seats: integer('seats').notNull(),
    status: electionStatus('status').default('CREATED').notNull(),
    date: timestamp('date').defaultNow().notNull(),
    csvFilePath: varchar('csv_file_path'),
    votingMethod: votingMethod('voting_method').default('STV').notNull()
  },
  (table) => [
    uniqueIndex('unique_active_election')
      .using('btree', sql`(TRUE)`)
      .where(sql`${table.status} <> 'CLOSED'`),
    check('check_elections_seats', sql`${table.seats} > 0`)
  ]
)

export const hasVoted = pgTable(
  'has_voted',
  {
    hasVotedId: uuid('has_voted_id').defaultRandom().primaryKey(),
    voterId: uuid('voter_id')
      .notNull()
      .references(() => voters.voterId, { onDelete: 'cascade' })
  },
  (table) => [unique('unique_voters_voterId').on(table.voterId)]
)

export const voters = pgTable(
  'voters',
  {
    voterId: uuid('voter_id').defaultRandom().primaryKey(),
    electionId: uuid('election_id')
      .notNull()
      .references(() => elections.electionId, { onDelete: 'cascade' }),
    email: varchar('email').notNull()
  },
  (table) => [
    uniqueIndex('unique_voters_electionId_email').using(
      'btree',
      table.electionId.asc().nullsLast(),
      sql`lower(${table.email}::text)`
    )
  ]
)

export const votes = pgTable(
  'votes',
  {
    voteId: uuid('vote_id').defaultRandom().primaryKey(),
    ballotId: uuid('ballot_id')
      .notNull()
      .references(() => ballots.ballotId, { onDelete: 'cascade' }),
    candidateId: uuid('candidate_id')
      .notNull()
      .references(() => candidates.candidateId, { onDelete: 'cascade' }),
    rank: integer('rank').notNull()
  },
  (table) => [
    unique('unique_votes_ballotId_candidateId').on(table.ballotId, table.candidateId),
    unique('unique_votes_ballotId_rank').on(table.ballotId, table.rank),
    check('check_votes_rank', sql`${table.rank} > 0`)
  ]
)
