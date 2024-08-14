import { api } from './api'

export const getVoterStatus = async (voterId: string) => {
  return await api<{ loggedIn: boolean; active: boolean }>(
    `/api/voter/${voterId}`
  )
}
