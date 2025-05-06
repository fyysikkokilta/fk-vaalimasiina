import 'dotenv/config'

import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import path from 'path'
import { Pool } from 'pg'

void (async () => {
  console.log('Migrating database...')
  const pool = new Pool({
    connectionString: process.env.DB_URL,
    // for migrations, we want to be able to run multiple queries in a single transaction
    max: 1
  })
  await migrate(drizzle({ client: pool }), {
    migrationsFolder: path.join(process.cwd(), 'src/drizzle')
  })
  await pool.end()
  console.log('Database migrated!')
})()
