import { router } from '../init'
import { adminElectionsRouter } from './admin/elections'
import { adminLoginRouter } from './admin/login'
import { adminVotersRouter } from './admin/voters'
import { adminVotesRouter } from './admin/votes'
import { electionsRouter } from './elections'
import { testDbRouter } from './test/db'
import { testElectionsRouter } from './test/elections'
import { testVotersRouter } from './test/voters'
import { testVotesRouter } from './test/votes'
import { votersRouter } from './voters'
import { votesRouter } from './votes'

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

export type AppRouter = typeof appRouter
export type TestRouter = typeof testRouter
