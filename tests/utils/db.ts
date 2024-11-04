import { APIRequestContext } from '@playwright/test'
import { Election, Vote, Voter } from '../../types/types'

export const resetDatabase = async (request: APIRequestContext) => {
  await request.post('/api/test/db')
}

export const insertElection = async (
  request: APIRequestContext,
  data: {
    title: string
    description: string
    amountToElect: number
    candidates: { name: string }[]
    status: 'CREATED' | 'ONGOING' | 'FINISHED' | 'CLOSED'
  }
) => {
  const response = await request.post('/api/test/elections', { data })
  return response.json() as Promise<Election>
}

export const insertVoters = async (
  request: APIRequestContext,
  data: { electionId: string; emails: string[] }
) => {
  const response = await request.post('/api/test/voters', { data })
  return response.json() as Promise<Voter[]>
}

export const insertVotes = async (
  request: APIRequestContext,
  data: {
    electionId: string
    voterIdBallotPairs: {
      voterId: string
      ballot: { candidateId: string; preferenceNumber: number }[]
    }[]
  }
) => {
  const response = await request.post('/api/test/votes', { data })
  return response.json() as Promise<Vote[]>
}
