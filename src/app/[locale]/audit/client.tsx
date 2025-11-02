'use client'

import { useTranslations } from 'next-intl'
import React, { useState } from 'react'

import TitleWrapper from '~/components/TitleWrapper'
import type { AuditPageProps } from '~/data/findFinishedElection'

export default function Audit({ election, ballots }: AuditPageProps) {
  const [search, setSearch] = useState('')
  const t = useTranslations('Audit')

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase().trim()
    setSearch(value)
  }

  const foundBallot = ballots.find(
    (audit) => audit.ballotId.toLowerCase().trim() === search
  )

  return !election || !ballots ? (
    <TitleWrapper title={t('title')}>
      <h2 className="mb-2 text-xl font-semibold">
        {t('no_finished_election')}
      </h2>
      <p className="text-fk-black">{t('no_finished_election_description')}</p>
    </TitleWrapper>
  ) : (
    <TitleWrapper title={t('title')}>
      <div className="mb-4">
        <label
          htmlFor="searchBallot"
          className="mb-2 block font-medium text-gray-700"
        >
          {t('search_ballot')}
        </label>
        <input
          id="searchBallot"
          type="password"
          className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder={t('ballot_id')}
          onChange={handleSearch}
        />
      </div>

      {!search ? (
        <div className="py-8 text-center">
          <p className="text-lg text-gray-500">{t('placeholder_no_id')}</p>
        </div>
      ) : foundBallot ? (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            {t('ballot')}
          </h3>
          <div className="space-y-2">
            {foundBallot.votes.length > 0 ? (
              foundBallot.votes
                .sort((a, b) => a.rank - b.rank)
                .map((vote, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 rounded bg-gray-50 p-2"
                  >
                    <span className="min-w-[2rem] font-medium text-gray-700">
                      {vote.rank}
                      {'.'}
                    </span>
                    <span className="text-gray-900">
                      {
                        election.candidates.find(
                          (candidate) =>
                            candidate.candidateId === vote.candidateId
                        )?.name
                      }
                    </span>
                  </div>
                ))
            ) : (
              <div className="py-4 text-center">
                <span className="text-gray-500 italic">
                  {t('empty_ballot')}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="text-lg text-red-500">
            {t('placeholder_incorrect_id')}
          </p>
        </div>
      )}
    </TitleWrapper>
  )
}
