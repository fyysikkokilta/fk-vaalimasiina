import { Election } from '../../types/types'
import { api } from './api'

export const fetchCurrentElection = async () => {
  return await api<Election[]>(`/api/elections`)
}

export const fetchElectionById = async (electionId: string) => {
  return await api<Election>(`/api/elections/${electionId}`)
}
