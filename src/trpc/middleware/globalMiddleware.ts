import { trpcMiddleware } from '../init'

export const globalMiddleware = trpcMiddleware(async (opts) => {
  const { ctx, next } = opts
  if (process.env.NODE_ENV === 'development') {
    console.log('Request:', ctx?.req?.url)
  }
  return next()
})
