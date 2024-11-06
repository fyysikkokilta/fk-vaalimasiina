import { Ballot } from '../../../../types/types'
import { api } from '../api'

export const getVotesForElection = async (electionId: string) => {
  return await api<Ballot[]>(`/api/admin/votes/${electionId}`)
}

export const getVoteCount = async (electionId: string) => {
  return await api<number>(`/api/admin/votes/${electionId}/count`)
}
