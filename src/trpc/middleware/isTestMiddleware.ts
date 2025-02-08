import { TRPCError } from '@trpc/server'

import { trpcMiddleware } from '../init'

export const isTestMiddleware = trpcMiddleware(({ next }) => {
  const isTest = process.env.NODE_ENV === 'development'

  if (!isTest) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Test routes are only available in development'
    })
  }

  return next()
})
