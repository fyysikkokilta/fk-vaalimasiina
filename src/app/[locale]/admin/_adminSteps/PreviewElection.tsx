'use client'

import { useTranslations } from 'next-intl'
import React from 'react'

import { protectedStartEditing } from '~/actions/admin/election/startEditing'
import { protectedStartVoting } from '~/actions/admin/election/startVoting'
import AdminNavigation from '~/components/AdminNavigation'
import { useToastedActionState } from '~/hooks/useToastedActionState'
import { ElectionStep } from '~/settings/electionStepSettings'

import { ElectionStepProps } from '../page'

export default function PreviewElection({
  election: { electionId, title, description, seats, candidates }
}: ElectionStepProps) {
  const t = useTranslations('admin.admin_main.preview_election')

  const startEditingAction = protectedStartEditing.bind(null, electionId)
  const startVotingAction = protectedStartVoting.bind(null, electionId)

  const [, startEditing, startEditingPending] = useToastedActionState(
    startEditingAction,
    {
      success: false,
      message: ''
    },
    'admin.admin_main.preview_election'
  )

  const [submitState, startVoting, startVotingPending] = useToastedActionState(
    startVotingAction,
    {
      success: false,
      message: '',
      errors: { formErrors: [], fieldErrors: {} },
      formData: new FormData()
    },
    'admin.admin_main.preview_election'
  )

  return (
    <AdminNavigation
      electionStep={ElectionStep.PREVIEW}
      disablePrevious={startEditingPending}
      disableNext={startVotingPending}
      onBack={startEditing}
      onNext={startVoting}
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
              name="emails"
              rows={5}
              defaultValue={
                ('formData' in submitState &&
                  (submitState.formData?.get('emails') as string)) ||
                ''
              }
              placeholder={t('email_list_placeholder')}
              className={
                'w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none'
              }
            />
            {'errors' in submitState &&
              submitState.errors.fieldErrors.emails?.map((error) => (
                <div key={error} className="text-red-500">
                  {t(error)}
                </div>
              ))}
          </div>
        </div>
        {'errors' in submitState &&
          submitState.errors.fieldErrors.electionId?.map((error) => (
            <div key={error} className="text-red-500">
              {t(error)}
            </div>
          ))}
      </div>
      {'errors' in submitState &&
        submitState.errors.formErrors.map((error) => (
          <div key={error} className="text-red-500">
            {t(error)}
          </div>
        ))}
    </AdminNavigation>
  )
}
