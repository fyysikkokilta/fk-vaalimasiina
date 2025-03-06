'use client'

import { useTranslations } from 'next-intl'
import { InferSafeActionFnInput } from 'next-safe-action'

import type { createElection } from '~/actions/admin/election/createElection'
import type { editElection } from '~/actions/admin/election/editElection'

export default function ElectionForm({
  result,
  election,
  newCandidate,
  setNewCandidate,
  handleChange,
  addCandidate,
  removeCandidate
}: {
  result: {
    serverError?: string | undefined
    validationErrors?:
      | {
          formErrors: string[]
          fieldErrors: {
            title?: string[] | undefined
            description?: string[] | undefined
            seats?: string[] | undefined
            candidates?: string[] | undefined
          }
        }
      | undefined
  }
  election: InferSafeActionFnInput<
    typeof createElection | typeof editElection
  >['parsedInput']
  newCandidate: string
  setNewCandidate: (value: string) => void
  handleChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    isNumber?: boolean
  ) => void
  addCandidate: (candidateName: string) => void
  removeCandidate: (index: number) => void
}) {
  const t = useTranslations('admin.admin_main.new_election')

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
            value={election.title}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          {result.validationErrors?.fieldErrors.title?.map((error) => (
            <div key={error} className="text-red-500">
              {error}
            </div>
          ))}
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
            value={election.description}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          {result.validationErrors?.fieldErrors.description?.map((error) => (
            <div key={error} className="text-red-500">
              {error}
            </div>
          ))}
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
            value={election.seats}
            onChange={(e) => handleChange(e, true)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          {result.validationErrors?.fieldErrors.seats?.map((error) => (
            <div key={error} className="text-red-500">
              {error}
            </div>
          ))}
        </div>
      </div>
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
          {result.validationErrors?.fieldErrors.candidates?.map((error) => (
            <div key={error} className="text-red-500">
              {error}
            </div>
          ))}
        </div>
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            {t('candidates')}
          </label>
          <ul className="space-y-2">
            {election.candidates.map((candidate, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
              >
                <span className="font-medium">{candidate}</span>
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
      {result.validationErrors?.formErrors.map((error) => (
        <div key={error} className="text-red-500">
          {error}
        </div>
      ))}
    </div>
  )
}
