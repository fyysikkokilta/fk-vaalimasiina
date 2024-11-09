import axios from 'axios'
import { Ballot, Election, Voter } from '../../types/types'
import { randomInt } from 'crypto'
import _ from 'lodash'

const instance = axios.create({
  baseURL: 'http://localhost:3000'
})

export const resetDatabase = async () => {
  await instance.post('/api/test/db')
}

export const insertElection = async (data: {
  title: string
  description: string
  seats: number
  candidates: { name: string }[]
  status: 'CREATED' | 'ONGOING' | 'FINISHED' | 'CLOSED'
}) => {
  const response = await instance.post<Election>('/api/test/elections', data)
  return response.data
}

export const insertVoters = async (data: {
  electionId: string
  emails: string[]
}) => {
  const response = await instance.post<Voter[]>('/api/test/voters', data)
  return response.data
}

export const insertVotes = async (data: {
  electionId: string
  voterIdBallotPairs: {
    voterId: string
    ballot: { candidateId: string; preferenceNumber: number }[]
  }[]
}) => {
  const response = await instance.post<Ballot[]>('/api/test/votes', data)
  return response.data
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
      ballot: _.shuffle(Array.from({ length: candidateCount }, (_, i) => i + 1))
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
