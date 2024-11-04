import { api } from './api'
import { Voter } from '../../../types/types'

export const getVoter = async (voterId: string) => {
  return await api<Voter>(`/api/voters/${voterId}`)
}
