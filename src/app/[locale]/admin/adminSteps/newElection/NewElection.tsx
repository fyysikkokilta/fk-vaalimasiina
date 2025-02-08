import { useTranslations } from 'next-intl'
import React, { useState } from 'react'

import { ElectionStep } from '~/app/[locale]/admin/adminSteps/electionStepSetting'
import { useRouter } from '~/i18n/routing'
import { RouterInput, trpc } from '~/trpc/client'

import { AdminProps } from '../../client'
import AdminNavigation from '../adminNavigation/AdminNavigation'

// Used for both creating a new election and editing an existing one

type NewElectionProps = AdminProps & {
  previousStep: () => void
}

export default function NewElection({
  election,
  previousStep
}: NewElectionProps) {
  const create = trpc.admin.elections.create.useMutation()
  const update = trpc.admin.elections.update.useMutation()
  const utils = trpc.useUtils()
  const [newCandidate, setNewCandidate] = useState('')
  const [newElection, setNewElection] = useState<
    RouterInput['admin']['elections']['create']
  >(
    election ?? {
      title: '',
      description: '',
      seats: 0,
      candidates: []
    }
  )
  const t = useTranslations('admin.admin_main.new_election')
  const router = useRouter()

  const handleChange = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
    isNumber: boolean = false
  ) => {
    setNewElection((electionState) => ({
      ...electionState,
      [event.target.name]: isNumber
        ? parseInt(event.target.value)
        : event.target.value
    }))
  }

  const addCandidate = (candidateName: string) => {
    setNewElection((electionState) => ({
      ...electionState,
      candidates: [...electionState.candidates, { name: candidateName }]
    }))
    setNewCandidate('')
  }

  const removeCandidate = (index: number) => {
    setNewElection((electionState) => {
      const updatedCandidates = electionState.candidates.filter(
        (_, i) => i !== index
      )

      return {
        ...electionState,
        candidates: updatedCandidates
      }
    })
  }

  const handleCancelEdit = () => {
    previousStep()
  }

  const handleSubmit = () => {
    if (!election) {
      create.mutate(newElection, {
        onSuccess() {
          void utils.admin.elections.findCurrent.invalidate()
        },
        onError(error) {
          const code = error?.data?.code
          if (code === 'NOT_FOUND') {
            router.refresh()
          }
        }
      })
    } else {
      update.mutate(
        {
          electionId: election.electionId,
          ...newElection
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
  }

  const disabled = !(
    newElection.title &&
    newElection.description &&
    newElection.seats &&
    newElection.seats > 0 &&
    newElection.candidates.length
  )

  return (
    <>
      <AdminNavigation
        electionStep={election ? ElectionStep.EDIT : ElectionStep.NEW}
        disableNext={disabled}
        onBack={handleCancelEdit}
        onNext={handleSubmit}
      />
      <form className="mx-auto mt-3 max-w-6xl px-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Left Column */}
          <div>
            <div className="mb-4">
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                {t('election_title')}
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={newElection.title}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                {t('description')}
              </label>
              <textarea
                id="description"
                name="description"
                value={newElection.description}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="seats"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                {t('seats')}
              </label>
              <input
                type="number"
                id="seats"
                name="seats"
                value={newElection.seats}
                onChange={(e) => handleChange(e, true)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Right Column */}
          <div>
            <div className="mb-4">
              <label
                htmlFor="newCandidate"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                {t('new_candidate')}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="newCandidate"
                  value={newCandidate}
                  onChange={(e) => setNewCandidate(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  disabled={!newCandidate}
                  onClick={() => addCandidate(newCandidate)}
                  className={`rounded-lg px-4 py-2 ${
                    !newCandidate
                      ? 'cursor-not-allowed bg-gray-300'
                      : 'cursor-pointer bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {t('add_candidate')}
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                {t('candidates')}
              </label>
              <ul className="space-y-2">
                {newElection.candidates.map((candidate, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                  >
                    <span className="font-medium">{candidate.name}</span>
                    <button
                      type="button"
                      onClick={() => removeCandidate(i)}
                      className="cursor-pointer rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-800"
                    >
                      {t('remove_candidate')}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </form>
    </>
  )
}
