import { useTranslations } from 'next-intl'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

import { ElectionStep } from '~/app/[locale]/admin/adminSteps/electionStepSetting'
import { useRouter } from '~/i18n/routing'
import { trpc } from '~/trpc/client'

import { AdminProps } from '../../client'
import AdminNavigation from '../adminNavigation/AdminNavigation'

export default function VotingInspection({ election }: AdminProps) {
  const abort = trpc.admin.elections.abortVoting.useMutation()
  const end = trpc.admin.elections.endVoting.useMutation()
  const updateEmail = trpc.admin.voters.updateEmail.useMutation()
  const utils = trpc.useUtils()
  const t = useTranslations('admin.admin_main.voting_inspection')
  const router = useRouter()

  const [oldEmail, setOldEmail] = useState('')
  const [newEmail, setNewEmail] = useState('')

  useEffect(() => {
    if (!election) return
    void utils.admin.elections.findCurrent.invalidate()

    const interval = setInterval(
      () => void utils.admin.elections.findCurrent.invalidate(),
      3000
    )

    return () => clearInterval(interval)
  }, [election, utils.admin.elections.findCurrent])

  const handleAbortVoting = (electionId: string) => {
    abort.mutate(
      {
        electionId
      },
      {
        onSuccess() {
          void utils.admin.elections.findCurrent.invalidate()
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

  const handleEndVoting = (electionId: string) => {
    end.mutate(
      {
        electionId
      },
      {
        onSuccess() {
          void utils.admin.elections.findCurrent.invalidate()
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

  if (!election) {
    return null // Should never happen
  }

  const { voters } = election

  const remainingVoters = voters.filter((voter) => !voter.hasVoted)
  const votersWhoVoted = voters.filter((voter) => voter.hasVoted)

  const validNewEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)

  return (
    <>
      <AdminNavigation
        electionStep={ElectionStep.VOTING}
        disableNext={remainingVoters.length > 0}
        onBack={() => handleAbortVoting(election.electionId)}
        onNext={() => handleEndVoting(election.electionId)}
      />
      <div className="mx-auto max-w-2xl px-4">
        <div className="flex flex-col items-center">
          <h3 className="mb-2 text-xl font-semibold">{election.title}</h3>
          <p className="mb-4 text-center">{election.description}</p>

          <div className="w-full space-y-2 rounded-lg border border-gray-200 p-4">
            <div className="rounded-lg border border-gray-200 p-3">
              <span>
                {t('given_votes')}: {votersWhoVoted.length}
              </span>
            </div>
            <div className="rounded-lg border border-gray-200 p-3">
              <span>
                {t('voters')}: {voters.length}
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
                className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
    </>
  )
}
