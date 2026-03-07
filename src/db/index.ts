import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import { env } from '~/env'

import { relations } from './relations'

const client = new Pool({
  connectionString: env.DATABASE_URL
})

export const db = drizzle({
  client,
  relations,
  logger: env.NODE_ENV === 'development'
})
