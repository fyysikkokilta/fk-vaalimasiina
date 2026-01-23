'use client'

import { useTranslations } from 'next-intl'
import { useAction } from 'next-safe-action/hooks'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

import { abortVoting } from '~/actions/admin/abortVoting'
import { changeEmail } from '~/actions/admin/changeEmail'
import { endVoting } from '~/actions/admin/endVoting'
import { pollVotes } from '~/actions/admin/pollVotes'
import AdminNavigation from '~/components/AdminNavigation'
import type { ElectionStepProps } from '~/data/getAdminElection'
import { ElectionStep } from '~/settings/electionStepSettings'

export default function VotingInspection({
  election: { electionId, title, description },
  voters
}: ElectionStepProps) {
  const [oldEmail, setOldEmail] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [showRemainingVoters, setShowRemainingVoters] = useState(false)
  const t = useTranslations('VotingInspection')

  const { execute: executeAbort, isPending: isPendingAbort } = useAction(
    abortVoting,
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

  const { execute: executeVoting, isPending: isPendingVoting } = useAction(
    endVoting,
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
    execute: executeEmail,
    isPending: isPendingEmail,
    result: resultEmail
  } = useAction(changeEmail, {
    onSuccess: ({ data }) => {
      if (data?.message) {
        toast.success(data.message)
      }
      setOldEmail('')
      setNewEmail('')
    },
    onError: ({ error }) => {
      if (error.serverError) {
        toast.error(error.serverError)
      }
    }
  })

  useEffect(() => {
    const interval = setInterval(() => {
      void pollVotes()
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const remainingVoters = voters.filter((voter) => !voter.hasVoted)
  const votersWhoVoted = voters.filter((voter) => voter.hasVoted)

  return (
    <AdminNavigation
      electionStep={ElectionStep.VOTING}
      disablePrevious={isPendingAbort}
      disableNext={remainingVoters.length > 0 || isPendingVoting}
      onBack={() => executeAbort({ electionId })}
      onNext={() => executeVoting({ electionId })}
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
                value={oldEmail}
                onChange={(e) => setOldEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-center shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {resultEmail.validationErrors?.fieldErrors.oldEmail?.map(
                (error) => (
                  <div key={error} className="text-red-500">
                    {error}
                  </div>
                )
              )}
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
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-center shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              {resultEmail.validationErrors?.fieldErrors.newEmail?.map(
                (error) => (
                  <div key={error} className="text-red-500">
                    {error}
                  </div>
                )
              )}
            </div>
            <button
              onClick={(e) => {
                e.preventDefault()
                executeEmail({ oldEmail, newEmail })
              }}
              disabled={isPendingEmail}
              className={
                'bg-fk-yellow text-fk-black w-full cursor-pointer rounded-lg px-4 py-2 transition-colors hover:bg-amber-500'
              }
            >
              {t('change_email')}
            </button>
          </div>
          <div className="mt-6 w-full">
            <div className="mb-3 flex justify-center">
              <button
                type="button"
                onClick={() => setShowRemainingVoters((value) => !value)}
                className="bg-fk-yellow text-fk-black cursor-pointer rounded-lg px-4 py-2 transition-colors hover:bg-amber-500"
              >
                {showRemainingVoters
                  ? t('hide_remaining_voters')
                  : t('show_remaining_voters')}
              </button>
            </div>
            {showRemainingVoters &&
              (remainingVoters.length === 0 ? (
                <div className="text-center text-sm text-gray-600">
                  {t('remaining_voters_empty')}
                </div>
              ) : (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {remainingVoters.map((voter) => (
                    <li
                      key={voter.email}
                      className="rounded-lg border border-gray-200 p-3 text-center"
                    >
                      {voter.email}
                    </li>
                  ))}
                </ul>
              ))}
          </div>
        </div>
      </div>
    </AdminNavigation>
  )
}
