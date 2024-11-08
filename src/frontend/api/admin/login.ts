import { api } from '../api'

export const login = async (username: string, password: string) => {
  return api<string>('/api/admin/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  })
}
