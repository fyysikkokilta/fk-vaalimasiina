import { useTranslations } from 'next-intl'
import React, { useContext, useState } from 'react'

import { ElectionStepContext } from '~/contexts/electionStep/ElectionStepContext'
import { useRouter } from '~/i18n/routing'
import { trpc } from '~/trpc/client'

import AdminNavigation from '../adminNavigation/AdminNavigation'

export default function PreviewElection() {
  const { election, setElection, setElectionStep } =
    useContext(ElectionStepContext)!
  const startVoting = trpc.admin.elections.startVoting.useMutation()
  const [emails, setEmails] = useState('')
  const t = useTranslations('admin.admin_main.preview_election')
  const router = useRouter()

  const getEmailLinesContainingText = (emails: string) => {
    return emails
      .split('\n')
      .map((email) => email.trim())
      .map((email) => email.toLowerCase())
      .filter(Boolean)
  }

  const validateEmails = (emails: string) => {
    const notEmpty = emails.trim().length > 0
    const emailArray = getEmailLinesContainingText(emails)
    const emailsOkay = emailArray.every((email) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    })
    const allEmailsUnique = emailArray.length === new Set(emailArray).size
    return notEmpty && emailsOkay && allEmailsUnique
  }

  const handleEdit = () => {
    setElectionStep('EDIT')
  }

  const handleSubmit = (electionId: string) => {
    startVoting.mutate(
      {
        electionId,
        emails: getEmailLinesContainingText(emails)
      },
      {
        onSuccess() {
          setElection((election) => ({ ...election!, status: 'ONGOING' }))
        },
        onError(error) {
          const code = error?.data?.code
          if (code === 'NOT_FOUND') {
            router.refresh()
          }
        }
      }
    )
  }

  const getValidEmailCount = (emailString: string) => {
    return getEmailLinesContainingText(emailString).length
  }

  if (!election) {
    return null // Should never happen
  }

  return (
    <>
      <AdminNavigation
        disableNext={!validateEmails(emails)}
        onBack={handleEdit}
        onNext={() => handleSubmit(election.electionId)}
      />
      <div className="mx-auto max-w-2xl px-4">
        <div className="flex flex-col items-center">
          <h3 className="mb-3 text-xl font-semibold">{election.title}</h3>
          <p className="mb-3 text-center">{election.description}</p>
          <div className="mb-3">
            {t('seats')}: {election.seats}
          </div>

          <h4 className="font-medium">{t('candidates')}</h4>
          <ul className="w-full space-y-2">
            {election.candidates.map((candidate, index) => (
              <li
                key={candidate.candidateId}
                className="rounded-lg border border-gray-200 p-3"
              >
                {index + 1}. {candidate.name}
              </li>
            ))}
          </ul>

          <h4 className="mt-6 font-medium">{t('voters')}</h4>
          <div className="w-full">
            <label
              htmlFor="emailList"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              {t('email_list_instruction')}
            </label>
            <textarea
              id="emailList"
              rows={5}
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder={t('email_list_placeholder')}
              className={`w-full rounded-lg border px-3 py-2 shadow-sm focus:ring-2 focus:outline-none ${
                emails.length > 0
                  ? validateEmails(emails)
                    ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                    : 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
              }`}
            />
          </div>

          {emails.length > 0 && (
            <div
              className={`mt-2 text-center ${
                validateEmails(emails) ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {validateEmails(emails)
                ? `${t('voter_count')}: ${getValidEmailCount(emails)}`
                : t('invalid_emails')}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
