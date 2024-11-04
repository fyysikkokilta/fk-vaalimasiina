import { api } from './api'
import { Vote } from '../../../types/types'

export const getVotesForElection = async (electionId: string) => {
  return await api<Vote[]>(`/api/votes/${electionId}`)
}
