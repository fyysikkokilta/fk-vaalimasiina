import { Election, ElectionData } from '../../../../types/types'
import { api } from '../api'

export const fetchCurrentElection = async () => {
  return await api<Election>(`/api/admin/elections/current`)
}

export const postNewElection = (election: ElectionData) => {
  return api<Election>(`/api/admin/elections`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(election)
  })
}

export const modifyElection = (electionId: string, election: ElectionData) => {
  return api<Election>(`/api/admin/elections/${electionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(election)
  })
}

export const startVoting = (electionId: string, emails: string[]) => {
  return api<Election>(`/api/admin/elections/${electionId}/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ emails })
  })
}

export const endVoting = (electionId: string) => {
  return api<Election>(`/api/admin/elections/${electionId}/end`, {
    method: 'POST'
  })
}

export const closeElection = (electionId: string) => {
  return api<Election>(`/api/admin/elections/${electionId}/close`, {
    method: 'POST'
  })
}

export const abortVoting = (electionId: string) => {
  return api<Election>(`/api/admin/elections/${electionId}/abort`, {
    method: 'POST'
  })
}
