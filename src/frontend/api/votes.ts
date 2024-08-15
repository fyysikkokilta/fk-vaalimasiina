import { api } from './api'
import { Vote } from '../../../types/types'

export const getVotesForCompletedElection = async (electionId: string) => {
  return await api<Vote[]>(`/api/votes/${electionId}`)
}
