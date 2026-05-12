import {
  snakeCase,
  pgEnum,
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

export const ballots = snakeCase.table('ballots', {
  ballotId: uuid().defaultRandom().primaryKey(),
  electionId: uuid()
    .notNull()
    .references(() => elections.electionId, { onDelete: 'cascade' })
})

export const candidates = snakeCase.table('candidates', {
  candidateId: uuid().defaultRandom().primaryKey(),
  electionId: uuid()
    .notNull()
    .references(() => elections.electionId, { onDelete: 'cascade' }),
  name: varchar().notNull()
})

export const elections = snakeCase.table(
  'elections',
  {
    electionId: uuid().defaultRandom().primaryKey(),
    title: varchar().notNull(),
    description: varchar().notNull(),
    seats: integer().notNull(),
    status: electionStatus().default('CREATED').notNull(),
    date: timestamp().defaultNow().notNull(),
    csvFilePath: varchar(),
    votingMethod: votingMethod().default('STV').notNull()
  },
  (table) => [
    uniqueIndex('unique_active_election')
      .using('btree', sql`(TRUE)`)
      .where(sql`${table.status} <> 'CLOSED'`),
    check('check_elections_seats', sql`${table.seats} > 0`)
  ]
)

export const hasVoted = snakeCase.table(
  'has_voted',
  {
    hasVotedId: uuid().defaultRandom().primaryKey(),
    voterId: uuid()
      .notNull()
      .references(() => voters.voterId, { onDelete: 'cascade' })
  },
  (table) => [unique('unique_voters_voterId').on(table.voterId)]
)

export const voters = snakeCase.table(
  'voters',
  {
    voterId: uuid().defaultRandom().primaryKey(),
    electionId: uuid()
      .notNull()
      .references(() => elections.electionId, { onDelete: 'cascade' }),
    email: varchar().notNull()
  },
  (table) => [
    uniqueIndex('unique_voters_electionId_email').using(
      'btree',
      table.electionId.asc().nullsLast(),
      sql`lower(${table.email}::text)`
    )
  ]
)

export const votes = snakeCase.table(
  'votes',
  {
    voteId: uuid().defaultRandom().primaryKey(),
    ballotId: uuid()
      .notNull()
      .references(() => ballots.ballotId, { onDelete: 'cascade' }),
    candidateId: uuid()
      .notNull()
      .references(() => candidates.candidateId, { onDelete: 'cascade' }),
    rank: integer().notNull()
  },
  (table) => [
    unique('unique_votes_ballotId_candidateId').on(table.ballotId, table.candidateId),
    unique('unique_votes_ballotId_rank').on(table.ballotId, table.rank),
    check('check_votes_rank', sql`${table.rank} > 0`)
  ]
)
