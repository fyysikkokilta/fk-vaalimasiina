import 'dotenv/config'

import { drizzle } from 'drizzle-orm/postgres-js'
import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { resolve } from 'path'
import postgres from 'postgres'

void (async () => {
  console.log('Migrating database...')
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
    migrationsFolder: resolve('src/drizzle')
  })
  await migrationClient.end()
  console.log('Database migrated!')
})()
