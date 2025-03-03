import { router } from '../init'
import { adminElectionsRouter } from './admin/elections'
import { adminLoginRouter } from './admin/login'
import { adminVotersRouter } from './admin/voters'
import { testDbRouter } from './test/db'
import { testElectionsRouter } from './test/elections'
import { testLoginRouter } from './test/login'
import { testVotersRouter } from './test/voters'
import { testVotesRouter } from './test/votes'
import { votesRouter } from './votes'

const isDev = process.env.NODE_ENV === 'development'

const adminRouter = router({
  login: adminLoginRouter,
  elections: adminElectionsRouter,
  voters: adminVotersRouter
})

const testRouter = router({
  db: testDbRouter,
  login: testLoginRouter,
  elections: testElectionsRouter,
  voters: testVotersRouter,
  votes: testVotesRouter
})

export const appRouter = router({
  votes: votesRouter,
  admin: adminRouter,
  ...(isDev ? { test: testRouter } : {})
})

export type AppRouter = typeof appRouter
export type TestRouter = typeof testRouter
