import { api } from './api'
import { Ballot } from '../../../types/types'

export const getVotesForElection = async (electionId: string) => {
  return await api<Ballot[]>(`/api/votes/${electionId}`)
}
