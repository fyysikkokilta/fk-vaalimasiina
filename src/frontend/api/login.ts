import { Voter } from '../../../types/types'
import { api } from './api'

export const login = async (alias: string, identifier: string) => {
  return await api<Voter>(`/api/login/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ alias, identifier }),
  })
}

export const logout = async (voterId: string) => {
  return await api<Voter>(`/api/login/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ voterId }),
  })
}
