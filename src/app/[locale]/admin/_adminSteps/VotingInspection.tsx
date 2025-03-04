'use client'

import { useTranslations } from 'next-intl'
import React, { useEffect } from 'react'

import { protectedChangeEmail } from '~/actions/admin/changeEmail'
import { protectedAbortVoting } from '~/actions/admin/election/abortVoting'
import { protectedEndVoting } from '~/actions/admin/election/endVoting'
import { protectedPollVotes } from '~/actions/admin/election/pollVotes'
import AdminNavigation from '~/components/AdminNavigation'
import { useToastedActionState } from '~/hooks/useToastedActionState'
import { ElectionStep } from '~/settings/electionStepSettings'

import { ElectionStepProps } from '../page'

export default function VotingInspection({
  election: { electionId, title, description },
  voters
}: ElectionStepProps) {
  const t = useTranslations('admin.admin_main.voting_inspection')

  const [, formAction, pending] = useToastedActionState(
    protectedChangeEmail,
    {
      success: false,
      message: ''
    },
    'admin.admin_main.voting_inspection'
  )

  useEffect(() => {
    const interval = setInterval(() => {
      void protectedPollVotes()
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const remainingVoters = voters.filter((voter) => !voter.hasVoted)
  const votersWhoVoted = voters.filter((voter) => voter.hasVoted)

  const abortVotingAction = protectedAbortVoting.bind(null, electionId)
  const endVotingAction = protectedEndVoting.bind(null, electionId)

  return (
    <AdminNavigation
      electionStep={ElectionStep.VOTING}
      tKey="admin.admin_main.voting_inspection"
      disableNext={remainingVoters.length > 0}
      onBack={abortVotingAction}
      onNext={endVotingAction}
    >
      <div className="mx-auto max-w-lg p-6">
        <div className="flex flex-col items-center">
          <h3 className="mb-2 text-xl font-semibold">{title}</h3>
          <p className="mb-4 text-center">{description}</p>
          <div className="w-full space-y-2 rounded-lg border border-gray-200 p-4">
            <div className="rounded-lg border border-gray-200 p-3">
              <span>
                {t('given_votes')}
                {': '}
                {votersWhoVoted.length}
              </span>
            </div>
            <div className="rounded-lg border border-gray-200 p-3">
              <span>
                {t('voters')}
                {': '}
                {voters.length}
              </span>
            </div>
          </div>
          <div className="mt-6 w-full space-y-4">
            <div>
              <label
                htmlFor="oldEmail"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                {t('old_email')}
              </label>
              <input
                id="oldEmail"
                name="oldEmail"
                type="email"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-center shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="newEmail"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                {t('new_email')}
              </label>
              <input
                id="newEmail"
                name="newEmail"
                type="email"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-center shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <button
              formAction={formAction}
              type="submit"
              disabled={pending}
              className={
                'bg-fk-yellow text-fk-black w-full cursor-pointer rounded-lg px-4 py-2 transition-colors hover:bg-amber-500'
              }
            >
              {t('change_email')}
            </button>
          </div>
        </div>
      </div>
    </AdminNavigation>
  )
}
