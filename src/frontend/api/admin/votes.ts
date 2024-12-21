import { Ballot } from '../../../../types/types'
import { api } from '../api'

export const getVotesForElection = async (electionId: string) => {
  return await api<{ ballots: Ballot[]; voterCount: number }>(
    `/api/admin/votes/${electionId}`
  )
}
