import { Voter } from '../../../../types/types'
import { api } from '../api'

export const changeVoterEmail = (oldEmail: string, newEmail: string) => {
  return api<Voter>(`/api/admin/voters`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ oldEmail, newEmail })
  })
}

export const getVoters = (electionId: string) => {
  return api<Voter[]>(`/api/admin/voters/${electionId}`)
}
