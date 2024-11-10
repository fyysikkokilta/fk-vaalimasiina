import { api } from './api'
import { Election, Voter } from '../../../types/types'

export const getVoterWithElection = async (voterId: string) => {
  return await api<{ voter: Voter; election: Election }>(
    `/api/voters/${voterId}`
  )
}
