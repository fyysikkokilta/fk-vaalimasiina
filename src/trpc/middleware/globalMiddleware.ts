import { trpcMiddleware } from '../init'

export const globalMiddleware = trpcMiddleware(async (opts) => {
  const { ctx, next } = opts
  if (
    process.env.NODE_ENV === 'development' &&
    Object.keys(ctx).includes('req')
  ) {
    const { req } = ctx as { req: { url: string } }
    console.log('Request:', req.url)
  }
  return next()
})
