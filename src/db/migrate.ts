import 'dotenv/config'

import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import path from 'path'
import { Pool } from 'pg'

const client = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1
})

const db = drizzle({ client })

try {
  await migrate(db, {
    migrationsFolder: path.join(process.cwd(), 'src/drizzle')
  })
  console.log('Migration successful')
} catch (error) {
  console.error('Migration failed:', error)
}
