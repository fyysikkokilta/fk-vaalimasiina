import express from 'express'
import cors from 'cors'
import adminElectionsRouter from './handlers/admin/elections'
import adminLoginRouter from './handlers/admin/login'
import adminVotersRouter from './handlers/admin/voters'
import adminVotesRouter from './handlers/admin/votes'

import electionsRouter from './handlers/elections'
import votesRouter from './handlers/votes'
import votersRouter from './handlers/voters'

import testElectionsRouter from './handlers/test/elections'
import testVotesRouter from './handlers/test/votes'
import testVotersRouter from './handlers/test/voters'
import testDbRouter from './handlers/test/db'

import 'dotenv/config'
import { runMigrations } from './db'
import jsonwebtoken from 'jsonwebtoken'
import ViteExpress from 'vite-express'

if (
  !process.env.PORT ||
  !process.env.DB_HOST ||
  !process.env.DB_PORT ||
  !process.env.DB_USERNAME ||
  !process.env.DB_PASSWORD ||
  !process.env.DB_NAME ||
  !process.env.ADMIN_USERNAME ||
  !process.env.ADMIN_PASSWORD ||
  !process.env.JWT_SECRET ||
  !process.env.BASE_URL
) {
  throw new Error('Environment variables not set')
}

await runMigrations()

const app = express()

app.use(express.json())
app.use(cors())

app.use('/api/admin/login', adminLoginRouter)

app.use('/api/admin', (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({ key: 'unauthorized' })
  }

  const jwt = authHeader.split(' ')[1]

  try {
    jsonwebtoken.verify(jwt, process.env.JWT_SECRET!)
  } catch (err) {
    console.error(err)
    return res.status(401).json({ key: 'unauthorized' })
  }

  next()
})

app.use('/api/admin/elections', adminElectionsRouter)
app.use('/api/admin/voters', adminVotersRouter)
app.use('/api/admin/votes', adminVotesRouter)

app.use('/api/elections', electionsRouter)
app.use('/api/vote', votesRouter)
app.use('/api/voters', votersRouter)

if (process.env.NODE_ENV === 'development') {
  app.use('/api/test/elections', testElectionsRouter)
  app.use('/api/test/votes', testVotesRouter)
  app.use('/api/test/voters', testVotersRouter)
  app.use('/api/test/db', testDbRouter)
}

ViteExpress.listen(app, Number(process.env.PORT), () =>
  console.log(`Server listening on port ${process.env.PORT}`)
)
