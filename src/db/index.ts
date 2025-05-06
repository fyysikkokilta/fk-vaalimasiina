import 'dotenv/config'

import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { cache } from 'react'

import * as relations from './relations'
import * as schema from './schema'

export const getDb = cache(() => {
  const pool = new Pool({
    connectionString: process.env.DB_URL,
    // You don't want to reuse the same connection for multiple requests
    maxUses: 1
  })
  return drizzle({
    client: pool,
    schema: {
      ...schema,
      ...relations
    },
    logger: process.env.NODE_ENV === 'development'
  })
})
