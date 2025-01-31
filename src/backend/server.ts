import 'dotenv/config'

import { createExpressMiddleware } from '@trpc/server/adapters/express'
import express from 'express'
import ViteExpress from 'vite-express'

import { runMigrations } from './db'
import { adminElectionsRouter } from './router/admin/elections'
import { adminLoginRouter } from './router/admin/login'
import { adminVotersRouter } from './router/admin/voters'
import { adminVotesRouter } from './router/admin/votes'
import { electionsRouter } from './router/elections'
import { testDbRouter } from './router/test/db'
import { testElectionsRouter } from './router/test/elections'
import { testVotersRouter } from './router/test/voters'
import { testVotesRouter } from './router/test/votes'
import { votersRouter } from './router/voters'
import { votesRouter } from './router/votes'
import { createContext } from './trpc/context'
import { router } from './trpc/trpc'

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

const isDev = process.env.NODE_ENV === 'development'

const adminRouter = router({
  elections: adminElectionsRouter,
  login: adminLoginRouter,
  voters: adminVotersRouter,
  votes: adminVotesRouter
})

const testRouter = router({
  db: testDbRouter,
  elections: testElectionsRouter,
  voters: testVotersRouter,
  votes: testVotesRouter
})

export const appRouter = router({
  elections: electionsRouter,
  voters: votersRouter,
  votes: votesRouter,
  admin: adminRouter,
  ...(isDev ? { test: testRouter } : {})
})

const app = express()

app.use('/trpc', createExpressMiddleware({ router: appRouter, createContext }))

ViteExpress.listen(app, Number(process.env.PORT), () =>
  console.log(`Server listening on port ${process.env.PORT}`)
)

export type AppRouter = typeof appRouter
export type TestRouter = typeof testRouter
