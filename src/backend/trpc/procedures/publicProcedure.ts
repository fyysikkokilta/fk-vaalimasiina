import { globalMiddleware } from '../middleware/globalMiddleware'
import { trpcProcedure } from '../trpc'

export const publicProcedure = trpcProcedure.use(globalMiddleware)
