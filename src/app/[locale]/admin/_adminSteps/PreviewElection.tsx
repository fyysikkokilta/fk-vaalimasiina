'use client'

import { useMutation } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'

import AdminNavigation from '~/components/AdminNavigation'
import { ElectionStep } from '~/settings/electionStepSettings'
import { RouterOutput, useTRPC } from '~/trpc/client'

export default function PreviewElection({
  election
}: {
  election: Exclude<RouterOutput['admin']['elections']['findCurrent'], null>
}) {
  const trpc = useTRPC()
  const startVoting = useMutation(
    trpc.admin.elections.startVoting.mutationOptions()
  )
  const startEditing = useMutation(
    trpc.admin.elections.startEditing.mutationOptions()
  )
  const [emails, setEmails] = useState('')
  const t = useTranslations('admin.admin_main.preview_election')

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

  const handleStartEditing = async () => {
    await startEditing.mutateAsync({ electionId: election.electionId })
  }

  const handleSubmit = async () => {
    await startVoting.mutateAsync({
      electionId: election.electionId,
      emails: getEmailLinesContainingText(emails)
    })
  }

  const getValidEmailCount = (emailString: string) => {
    return getEmailLinesContainingText(emailString).length
  }

  return (
    <AdminNavigation
      electionStep={ElectionStep.PREVIEW}
      disableNext={!validateEmails(emails)}
      onBack={handleStartEditing}
      onNext={handleSubmit}
    >
      <div className="mx-auto max-w-lg p-6">
        <div className="flex flex-col items-center">
          <h3 className="mb-3 text-xl font-semibold">{election.title}</h3>
          <p className="mb-3 text-center">{election.description}</p>
          <div className="mb-3">
            {t('seats')}
            {': '}
            {election.seats}
          </div>
          <h4 className="mb-2 font-medium">{t('candidates')}</h4>
          <ul className="w-full space-y-2">
            {election.candidates.map((candidate, index) => (
              <li
                key={candidate.candidateId}
                className="rounded-lg border border-gray-200 p-3"
              >
                {index + 1}
                {'. '}
                {candidate.name}
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
    </AdminNavigation>
  )
}
