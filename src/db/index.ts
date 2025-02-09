import 'dotenv/config'

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as relations from './relations'
import * as schema from './schema'

// You can specify any property from the node-postgres connection options
export const client = postgres({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
})

export const db = drizzle(client, {
  schema: {
    ...schema,
    ...relations
  },
  logger: process.env.NODE_ENV === 'development'
})
