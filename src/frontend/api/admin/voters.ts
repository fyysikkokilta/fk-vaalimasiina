import { Voter } from '../../../../types/types'
import { api } from '../api'

export const changeVoterEmail = (voterId: string, email: string) => {
  return api<Voter>(`/api/admin/voters/${voterId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email })
  })
}

export const getVoters = (electionId: string) => {
  return api<Voter[]>(`/api/admin/voters/${electionId}`)
}
