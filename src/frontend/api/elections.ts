import { Ballot, Election } from '../../../types/types'
import { api } from './api'

export const fetchCompletedElections = async () => {
  return await api<Election[]>(`/api/elections`)
}

export const fetchCompletedElectionWithVotes = async (electionId: string) => {
  return await api<{
    election: Election
    ballots: Ballot[]
    voterCount: number
  }>(`/api/elections/${electionId}`)
}

export const fetchFinishedElectionWithVotes = async () => {
  return await api<{ election: Election; ballots: Ballot[] }>(
    `/api/elections/finished`
  )
}
