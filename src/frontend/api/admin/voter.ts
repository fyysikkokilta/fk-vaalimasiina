import { Voter } from '../../../../types/types'
import { api } from '../api'

export const getVoterCodes = () => {
  return api<Voter[]>(`/api/admin/voters`)
}

export const addVoterCode = (identifier: string) => {
  return api<Voter>(`/api/admin/voters`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ identifier }),
  })
}

export const deleteVoterCode = (identifier: string) => {
  return api<Voter>(`/api/admin/voters/${identifier}`, {
    method: 'DELETE',
  })
}

export const disableVoterCode = (identifier: string) => {
  return api<Voter>(`/api/admin/voters/${identifier}/disable`, {
    method: 'POST',
  })
}

export const enableVoterCode = (identifier: string) => {
  return api<Voter>(`/api/admin/voters/${identifier}/enable`, {
    method: 'POST',
  })
}

export const getActiveVoterCount = () => {
  return api<number>(`/api/admin/voters/active/count`)
}
