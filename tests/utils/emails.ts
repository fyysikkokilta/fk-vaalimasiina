import { APIRequestContext } from '@playwright/test'

export interface CapturedEmail {
  to: string
  subject: string
  electionTitle: string
  votingLinkFi: string
  votingLinkEn: string
}

export const getTestEmails = async (request: APIRequestContext): Promise<CapturedEmail[]> => {
  const response = await request.get('/api/test/emails')
  return response.json()
}

export const clearTestEmails = async (request: APIRequestContext) => {
  await request.delete('/api/test/emails')
}

export const setSmtpFailure = async (request: APIRequestContext, fail: boolean) => {
  await request.post('/api/test/smtp-failure', { data: { fail } })
}
