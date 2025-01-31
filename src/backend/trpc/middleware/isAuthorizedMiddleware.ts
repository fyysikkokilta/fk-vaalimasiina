import { TRPCError } from '@trpc/server'

import { trpcMiddleware } from '../trpc'

export const isAuthorizedMiddleware = trpcMiddleware(async (opts) => {
  const { ctx, next } = opts
  const isAuthorized = ctx.isAuthorized

  if (!isAuthorized) {
    throw new TRPCError({
      code: 'UNAUTHORIZED'
    })
  }

  return next()
})
