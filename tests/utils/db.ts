import axios from 'axios'
import { Ballot, Election, Voter } from '../../types/types'

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
