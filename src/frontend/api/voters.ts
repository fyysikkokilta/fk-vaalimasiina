import { Election, Voter } from '../../../types/types'
import { api } from './api'

export const getVoterWithElection = async (voterId: string) => {
  return await api<{ voter: Voter; election: Election }>(
    `/api/voters/${voterId}`
  )
}
