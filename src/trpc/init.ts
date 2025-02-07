import { initTRPC } from '@trpc/server'

import { Context } from './context'

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape }) {
    return shape
  }
})

export const trpcMiddleware = t.middleware
export const trpcProcedure = t.procedure
export const createCallerFactory = t.createCallerFactory
export const router = t.router
