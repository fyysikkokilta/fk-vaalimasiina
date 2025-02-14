import { TRPCError } from '@trpc/server'

import { trpcMiddleware } from '../init'

export const isAuthorizedMiddleware = trpcMiddleware(async (opts) => {
  const { ctx, next } = opts
  const isAuthorized = ctx.authorized

  if (!isAuthorized) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'unauthorized'
    })
  }

  return next()
})
