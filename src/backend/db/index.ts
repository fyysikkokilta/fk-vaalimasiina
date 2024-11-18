import 'dotenv/config'

import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { resolve } from 'path'
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

export const runMigrations = async () => {
  const migrationClient = postgres({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // for migrations, we want to be able to run multiple queries in a single transaction
    max: 1
  })
  await migrate(drizzle(migrationClient), {
    migrationsFolder: resolve('./src/backend/drizzle')
  })
}
