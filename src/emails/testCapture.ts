export interface CapturedEmail {
  to: string
  subject: string
  electionTitle: string
  votingLinkFi: string
  votingLinkEn: string
}

// globalThis is shared across all module instances within the same Node.js
// process, regardless of how Next.js bundles server actions vs route handlers.
const g = globalThis as typeof globalThis & {
  __vaalimasiina_testEmails?: CapturedEmail[]
  __vaalimasiina_testEmailFail?: boolean
}
if (!g.__vaalimasiina_testEmails) g.__vaalimasiina_testEmails = []
if (g.__vaalimasiina_testEmailFail === undefined) g.__vaalimasiina_testEmailFail = false

export const captureTestEmail = (email: CapturedEmail) => g.__vaalimasiina_testEmails!.push(email)
export const getTestEmails = () => [...g.__vaalimasiina_testEmails!]
export const clearTestEmails = () => {
  g.__vaalimasiina_testEmails = []
}
export const setTestEmailFailure = (fail: boolean) => {
  g.__vaalimasiina_testEmailFail = fail
}
export const getTestEmailFailure = () => g.__vaalimasiina_testEmailFail!
