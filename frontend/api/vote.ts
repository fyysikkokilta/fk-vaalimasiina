import { api } from './api'

export const vote = async (
  voterId: string,
  electionId: string,
  votes: string[]
) => {
  const ballot = votes.map((candidateId, index) => ({
    candidateId,
    // TODO: Handle preference number in the UI state
    preferenceNumber: index + 1,
  }))
  return await api<string[]>(`/api/vote/${electionId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ voterId, ballot }),
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
