import { APIRequestContext } from '@playwright/test'
import { randomInt } from 'crypto'

import { shuffleWithSeed } from '~/algorithm/shuffleWithSeed'

import { clearTables } from './routes/db'
import { changeStatus, createElection } from './routes/elections'
import { createVoters } from './routes/voters'
import { createVotes } from './routes/votes'

export type Election = Awaited<ReturnType<typeof createElection>>
export type Candidate = Election['candidates'][number]
export type Voter = Awaited<ReturnType<typeof createVoters>>[number]
export type Ballot = Awaited<ReturnType<typeof createVotes>>[number]
export type Vote = Ballot['votes'][number]

export const resetDatabase = async (request: APIRequestContext) => {
  await request.post('/api/revalidate', {
    data: {
      paths: ['/[locale]/elections', '/[locale]/audit', '/[locale]/admin']
    }
  })
  return clearTables()
}

export const insertElection = async (
  data: {
    title: string
    description: string
    seats: number
    candidates: { name: string }[]
    status: 'CREATED' | 'UPDATING' | 'ONGOING' | 'FINISHED' | 'CLOSED'
  },
  request: APIRequestContext
) => {
  await request.post('/api/revalidate', {
    data: {
      paths: ['/[locale]/elections', '/[locale]/audit', '/[locale]/admin']
    }
  })
  return createElection(data)
}

export const changeElectionStatus = async (
  electionId: string,
  status: 'CREATED' | 'UPDATING' | 'ONGOING' | 'FINISHED' | 'CLOSED',
  request: APIRequestContext
) => {
  await request.post('/api/revalidate', {
    data: {
      paths: ['/[locale]/elections', '/[locale]/audit', '/[locale]/admin']
    }
  })
  return changeStatus(electionId, status)
}

export const insertVoters = async (data: { electionId: string; emails: string[] }) => {
  return createVoters(data.electionId, data.emails)
}

export const insertVotes = async (data: {
  electionId: string
  voterIdBallotPairs: {
    voterId: string
    ballot: { candidateId: string; rank: number }[]
  }[]
}) => {
  return createVotes(data.electionId, data.voterIdBallotPairs)
}

export const createElectionWithVotersAndBallots = async (
  title: string,
  description: string,
  seats: number,
  status: 'CREATED' | 'UPDATING' | 'ONGOING' | 'FINISHED' | 'CLOSED',
  candidateCount: number,
  voteCount: number,
  request: APIRequestContext
) => {
  const election = await insertElection(
    {
      title,
      description,
      seats,
      candidates: Array.from({ length: candidateCount }, (_, i) => ({
        name: `Candidate ${i + 1}`
      })),
      status
    },
    request
  )
  const voters = await insertVoters({
    electionId: election.electionId,
    emails: Array.from({ length: voteCount }, (_, i) => `email${i + 1}@email.com`)
  })
  const ballots = await insertVotes({
    electionId: election.electionId,
    voterIdBallotPairs: voters.map((voter) => ({
      voterId: voter.voterId,
      ballot: shuffleWithSeed(
        Array.from({ length: candidateCount }, (_, i) => i + 1),
        randomInt(0, 1000).toString()
      )
        .map((preference, i) => ({
          candidateId: election.candidates[i].candidateId,
          rank: preference
        }))
        .toSorted((a, b) => a.rank - b.rank)
        .slice(0, randomInt(0, candidateCount))
    }))
  })

  return { election, voters, ballots }
}
