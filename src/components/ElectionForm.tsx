'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

import type { ElectionStepProps } from '~/app/[locale]/admin/page'

export default function ElectionForm({
  election
}: {
  election?: ElectionStepProps['election']
}) {
  const t = useTranslations('admin.admin_main.new_election')

  const [newCandidate, setNewCandidate] = useState('')
  const [candidates, setCandidates] = useState<string[]>(
    election?.candidates.map((c) => c.name) || []
  )

  const addCandidate = (candidateName: string) => {
    setCandidates((candidates) => [...candidates, candidateName])
    setNewCandidate('')
  }

  const removeCandidate = (index: number) => {
    setCandidates((candidates) => candidates.filter((_, i) => i !== index))
  }
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
            required
            defaultValue={election?.title || ''}
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
            required
            defaultValue={election?.description || ''}
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
            required
            defaultValue={election?.seats || ''}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
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
        </div>
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            {t('candidates')}
          </label>
          <ul className="space-y-2">
            {candidates.map((candidate, i) => (
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
        {candidates.map((candidate, i) => (
          <input key={i} type="hidden" name="candidates" value={candidate} />
        ))}
      </div>
    </div>
  )
}
