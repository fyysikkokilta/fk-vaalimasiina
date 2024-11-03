import { api } from './api'
import { Voter } from '../../../types/types'

export const getVoter = async (votingId: string) => {
  return await api<Voter>(`/api/voters/${votingId}`)
}
