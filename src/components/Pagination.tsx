'use client'

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
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`rounded-md px-3 py-2 text-sm font-medium ${
            currentPage === 1
              ? 'cursor-not-allowed bg-gray-100 text-gray-400'
              : 'bg-fk-yellow text-fk-black transition-colors hover:bg-amber-500'
          }`}
        >
          {translations.previous}
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`rounded-md px-3 py-2 text-sm font-medium ${
            currentPage === totalPages
              ? 'cursor-not-allowed bg-gray-100 text-gray-400'
              : 'bg-fk-yellow text-fk-black transition-colors hover:bg-amber-500'
          }`}
        >
          {translations.next}
        </button>
      </div>
    </div>
  )
}
