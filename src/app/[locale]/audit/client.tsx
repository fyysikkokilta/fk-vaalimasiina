'use client'

import { useTranslations } from 'next-intl'
import React, { useMemo, useState } from 'react'

import Pagination from '~/components/Pagination'
import TitleWrapper from '~/components/TitleWrapper'

import type { AuditPageProps } from './page'

const ITEMS_PER_PAGE = 25

export default function Audit({ election, ballots }: AuditPageProps) {
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const t = useTranslations('Audit')

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.toLowerCase().trim()
    setSearch(value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const match = ballots.filter(
    (audit) => audit.ballotId.toLowerCase().trim() === search
  )

  const allOrOneBallot = match.length === 1 ? match : ballots

  // Calculate pagination
  const totalItems = allOrOneBallot.length
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedBallots = allOrOneBallot.slice(startIndex, endIndex)

  const paginationTranslations = useMemo(
    () => ({
      page: t('pagination.page'),
      previous: t('pagination.previous'),
      next: t('pagination.next')
    }),
    [t]
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
      <table className="w-full border-collapse overflow-hidden rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              {t('ballot_number')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
              {t('ballot')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {paginatedBallots.map((audit, index) => (
            <tr key={index} id={audit.ballotId} className="hover:bg-gray-50">
              <td className="px-3 py-4 text-left text-sm text-gray-900">
                {`${index + 1}.`}
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
      <div className="mt-6">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          translations={paginationTranslations}
        />
      </div>
    </TitleWrapper>
  )
}
