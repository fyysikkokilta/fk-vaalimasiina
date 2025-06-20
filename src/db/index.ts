import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import { env } from '~/env'

import * as relations from './relations'
import * as schema from './schema'

const pool = new Pool({
  connectionString: env.DATABASE_URL
})

export const db = drizzle(pool, {
  schema: {
    ...schema,
    ...relations
  },
  logger: env.NODE_ENV === 'development'
})
