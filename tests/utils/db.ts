import { randomInt } from 'crypto'

import { shuffleWithSeed } from '../../src/frontend/algorithm/shuffleWithSeed'
import { testClient, TestRouterOutput } from '../../src/frontend/trpc/trpc'

export type Election = TestRouterOutput['elections']['create']
export type Candidate = Election['candidates'][number]
export type Voter = TestRouterOutput['voters']['create'][number]
export type Ballot = TestRouterOutput['votes']['create'][number]
export type Vote = Ballot['votes'][number]

export const resetDatabase = () => {
  if (!testClient.test) {
    throw new Error('test router should only be called in test environment')
  }
  return testClient.test.db.reset.mutate()
}

export const insertElection = (data: {
  title: string
  description: string
  seats: number
  candidates: { name: string }[]
  status: 'CREATED' | 'ONGOING' | 'FINISHED' | 'CLOSED'
}) => {
  if (!testClient.test) {
    throw new Error('test router should only be called in test environment')
  }
  return testClient.test.elections.create.mutate(data)
}

export const changeElectionStatus = (
  electionId: string,
  status: 'CREATED' | 'ONGOING' | 'FINISHED' | 'CLOSED'
) => {
  if (!testClient.test) {
    throw new Error('test router should only be called in test environment')
  }
  return testClient.test.elections.changeStatus.mutate({ electionId, status })
}

export const insertVoters = async (data: {
  electionId: string
  emails: string[]
}) => {
  if (!testClient.test) {
    throw new Error('test router should only be called in test environment')
  }
  return testClient.test.voters.create.mutate(data)
}

export const insertVotes = async (data: {
  electionId: string
  voterIdBallotPairs: {
    voterId: string
    ballot: { candidateId: string; preferenceNumber: number }[]
  }[]
}) => {
  if (!testClient.test) {
    throw new Error('test router should only be called in test environment')
  }
  return testClient.test.votes.create.mutate(data)
}

export const createElectionWithVotersAndBallots = async (
  title: string,
  description: string,
  seats: number,
  status: 'CREATED' | 'ONGOING' | 'FINISHED' | 'CLOSED',
  candidateCount: number,
  voteCount: number
) => {
  const election = await insertElection({
    title,
    description,
    seats,
    candidates: Array.from({ length: candidateCount }, (_, i) => ({
      name: `Candidate ${i + 1}`
    })),
    status
  })
  const voters = await insertVoters({
    electionId: election.electionId,
    emails: Array.from(
      { length: voteCount },
      (_, i) => `email${i + 1}@email.com`
    )
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
          preferenceNumber: preference
        }))
        .sort((a, b) => a.preferenceNumber - b.preferenceNumber)
        .slice(0, randomInt(0, candidateCount))
    }))
  })

  return { election, voters, ballots }
}
