'use client'

import { useTranslations } from 'next-intl'
import { useAction } from 'next-safe-action/hooks'
import React, { useState } from 'react'
import { toast } from 'react-toastify'

import { startEditing } from '~/actions/admin/startEditing'
import { startVoting } from '~/actions/admin/startVoting'
import AdminNavigation from '~/components/AdminNavigation'
import { ElectionStep } from '~/settings/electionStepSettings'

import { ElectionStepProps } from '../page'

export default function PreviewElection({
  election: { electionId, title, description, seats, candidates }
}: ElectionStepProps) {
  const [emails, setEmails] = useState('')

  const t = useTranslations('PreviewElection')

  const { execute: executeEditing, isPending: isPendingEditing } = useAction(
    startEditing,
    {
      onSuccess: ({ data }) => {
        if (data?.message) {
          toast.success(data.message)
        }
      },
      onError: ({ error }) => {
        if (error.serverError) {
          toast.error(error.serverError)
        }
      }
    }
  )

  const {
    execute: executeVoting,
    isPending: isPendingVoting,
    result: resultVoting
  } = useAction(startVoting, {
    onSuccess: ({ data }) => {
      if (data?.message) {
        toast.success(data.message)
      }
    },
    onError: ({ error }) => {
      if (error.serverError) {
        toast.error(error.serverError)
      } else {
        toast.error(t('invalid_voter_data'))
      }
    }
  })

  const getEmails = (emails: string) => {
    return emails
      .split('\n')
      .map((email) => email.trim())
      .map((email) => email.toLowerCase())
      .filter(Boolean)
  }

  return (
    <AdminNavigation
      electionStep={ElectionStep.PREVIEW}
      disablePrevious={isPendingEditing}
      disableNext={isPendingVoting}
      onBack={() => executeEditing({ electionId })}
      onNext={() =>
        executeVoting({
          electionId,
          emails: getEmails(emails) as [string, ...string[]]
        })
      }
    >
      <div className="mx-auto max-w-lg p-6">
        <div className="flex flex-col items-center">
          <h3 className="mb-3 text-xl font-semibold">{title}</h3>
          <p className="mb-3 text-center">{description}</p>
          <div className="mb-3">
            {t('seats')}
            {': '}
            {seats}
          </div>
          <h4 className="mb-2 font-medium">{t('candidates')}</h4>
          <ul className="w-full space-y-2">
            {candidates.map((candidate, index) => (
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
              htmlFor="emails"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              {t('email_list_instruction')}
            </label>
            <textarea
              id="emails"
              onChange={(e) => setEmails(e.target.value)}
              value={emails}
              rows={5}
              placeholder={t('email_list_placeholder')}
              className={
                'w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none'
              }
            />
            {resultVoting?.validationErrors?.fieldErrors.emails?.map(
              (error) => (
                <div key={error} className="text-red-500">
                  {error}
                </div>
              )
            )}
          </div>
          {emails.length > 0 && (
            <div className={'mt-2 text-center text-green-600'}>
              {`${t('voter_count')}: ${getEmails(emails).length}`}
            </div>
          )}
        </div>
      </div>
      {resultVoting.validationErrors?.formErrors?.map((error) => (
        <div key={error} className="text-center text-red-500">
          {error}
        </div>
      ))}
    </AdminNavigation>
  )
}
