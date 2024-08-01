import { api } from './api'

export const vote = async (
  voterId: string,
  electionId: string,
  votes: string[]
) => {
  return await api<string[]>(`/api/vote/${electionId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ voterId, votes }),
  })
}

export const checkIfAlreadyVoted = async (
  voterId: string,
  electionId: string
) => {
  return await api<boolean>(`/api/vote/${electionId}/check`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ voterId }),
  })
}
