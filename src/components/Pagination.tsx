'use client'

import { Button } from './ui/Button'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  translations: {
    page: string
    previous: string
    next: string
  }
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  translations
}: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
      <div className="text-sm text-gray-700">
        {translations.page} <span className="font-medium">{currentPage}</span>{' '}
        {'/ '}
        <span className="font-medium">{totalPages}</span>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          variant="yellow"
        >
          {translations.previous}
        </Button>
        <Button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          variant="yellow"
        >
          {translations.next}
        </Button>
      </div>
    </div>
  )
}
