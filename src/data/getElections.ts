import { cache } from 'react'

import { db } from '~/db'
import { env } from '~/env'

export const getElections = cache(async () => {
  // For building without database access
  // This generates empty pages and *.meta files need to be removed to generate them properly
  if (!env.DATABASE_URL) {
    return []
  }

  return db.query.electionsTable.findMany({
    where: (electionsTable, { eq }) => eq(electionsTable.status, 'CLOSED'),
    orderBy: (electionsTable, { desc }) => desc(electionsTable.date)
  })
})
