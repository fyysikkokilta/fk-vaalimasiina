'use client'

import { useTranslations } from 'next-intl'
import React, { useState } from 'react'

import TitleWrapper from '~/components/TitleWrapper'

import type { AuditPageProps } from './page'

export default function Audit({ election, ballots }: AuditPageProps) {
  const [search, setSearch] = useState('')
  const t = useTranslations('voter.audit')

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase().trim()
    setSearch(value)
  }
  const match = ballots.filter(
    (audit) => audit.ballotId.toLowerCase().trim() === search
  )

  const allOrOneBallot = match.length === 1 ? match : ballots

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
          type="text"
          className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder={t('ballot_id')}
          onChange={handleSearch}
        />
      </div>
      <table className="w-full border-collapse overflow-hidden rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              {t('ballot_id')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              {t('ballot')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {allOrOneBallot.map((audit, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm text-gray-500">
                {audit.ballotId}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                <div className="flex flex-wrap gap-2">
                  {audit.votes.length > 0 ? (
                    audit.votes
                      .sort((a, b) => a.rank - b.rank)
                      .map((vote, index) => (
                        <span key={index} className="text-gray-900">
                          {vote.rank}
                          {'. '}
                          {
                            election.candidates.find(
                              (candidate) =>
                                candidate.candidateId === vote.candidateId
                            )?.name
                          }
                        </span>
                      ))
                  ) : (
                    <span className="text-gray-500 italic">
                      {t('empty_ballot')}
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TitleWrapper>
  )
}
