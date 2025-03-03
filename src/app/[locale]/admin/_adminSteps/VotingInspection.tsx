'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

import AdminNavigation from '~/components/AdminNavigation'
import { ElectionStep } from '~/settings/electionStepSettings'
import { RouterOutput, useTRPC } from '~/trpc/client'

export default function VotingInspection({
  election
}: {
  election: NonNullable<RouterOutput['admin']['elections']['findCurrent']>
}) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const abort = useMutation(trpc.admin.elections.abortVoting.mutationOptions())
  const end = useMutation(trpc.admin.elections.endVoting.mutationOptions())
  const updateEmail = useMutation(
    trpc.admin.voters.updateEmail.mutationOptions()
  )
  const t = useTranslations('admin.admin_main.voting_inspection')

  const [oldEmail, setOldEmail] = useState('')
  const [newEmail, setNewEmail] = useState('')

  useEffect(() => {
    void queryClient.invalidateQueries(
      trpc.admin.elections.findCurrent.queryFilter()
    )

    const interval = setInterval(
      () =>
        void queryClient.invalidateQueries(
          trpc.admin.elections.findCurrent.queryFilter()
        ),
      3000
    )

    return () => clearInterval(interval)
  }, [election, queryClient, trpc.admin.elections.findCurrent])

  const handleAbortVoting = async () => {
    await abort.mutateAsync({
      electionId: election.electionId
    })
  }

  const handleEndVoting = async () => {
    await end.mutateAsync({
      electionId: election.electionId
    })
  }

  const handleEmailChange = () => {
    updateEmail.mutate(
      {
        oldEmail,
        newEmail
      },
      {
        onSuccess() {
          toast.success(t('email_changed'))
          setOldEmail('')
          setNewEmail('')
        }
      }
    )
  }

  const { voters } = election

  const remainingVoters = voters.filter((voter) => !voter.hasVoted)
  const votersWhoVoted = voters.filter((voter) => voter.hasVoted)

  const validNewEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)

  return (
    <AdminNavigation
      electionStep={ElectionStep.VOTING}
      disableNext={remainingVoters.length > 0}
      onBack={handleAbortVoting}
      onNext={handleEndVoting}
    >
      <div className="mx-auto max-w-lg p-6">
        <div className="flex flex-col items-center">
          <h3 className="mb-2 text-xl font-semibold">{election.title}</h3>
          <p className="mb-4 text-center">{election.description}</p>
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
          <form className="mt-6 w-full space-y-4">
            <div>
              <label
                htmlFor="oldEmail"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                {t('old_email')}
              </label>
              <input
                id="oldEmail"
                type="email"
                value={oldEmail}
                onChange={(e) => setOldEmail(e.target.value)}
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
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-center shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => void handleEmailChange()}
              disabled={!validNewEmail}
              className={`w-full rounded-lg px-4 py-2 ${
                !validNewEmail
                  ? 'cursor-not-allowed bg-gray-300'
                  : 'bg-fk-yellow text-fk-black cursor-pointer transition-colors hover:bg-amber-500'
              }`}
            >
              {t('change_email')}
            </button>
          </form>
        </div>
      </div>
    </AdminNavigation>
  )
}
