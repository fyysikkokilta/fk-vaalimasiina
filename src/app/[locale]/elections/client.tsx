'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

import Pagination from '~/components/Pagination'
import TitleWrapper from '~/components/TitleWrapper'
import { Link } from '~/i18n/navigation'

const ITEMS_PER_PAGE = 18

interface Election {
  electionId: string
  title: string
  date: Date
}

interface ElectionListClientProps {
  elections: Election[]
}

export default function ElectionListClient({ elections }: ElectionListClientProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const t = useTranslations('ElectionList')

  // Calculate pagination
  const totalItems = elections.length
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedElections = elections.slice(startIndex, endIndex)

  const paginationTranslations = {
    page: t('pagination.page'),
    previous: t('pagination.previous'),
    next: t('pagination.next')
  }

  return (
    <TitleWrapper title={t('title')}>
      {elections.length > 0 ? (
        <>
          <ul className="grid list-none grid-cols-1 place-items-center gap-4 p-0 md:grid-cols-3">
            {paginatedElections.map((election) => (
              <li
                key={election.electionId}
                className="w-full max-w-md rounded-lg border transition-colors hover:bg-gray-50"
              >
                <Link
                  href={`/elections/${election.electionId}`}
                  className="block px-4 py-3 text-center text-gray-900 hover:text-gray-700"
                >
                  <div className="font-medium">{election.title}</div>
                  <div className="mt-1 text-sm text-gray-500">
                    {election.date.toLocaleDateString('fi-FI')}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              translations={paginationTranslations}
            />
          </div>
        </>
      ) : (
        <>
          <span>{t('no_previous_results')}</span>
          <p>{t('no_previous_results_description')}</p>
        </>
      )}
    </TitleWrapper>
  )
}
