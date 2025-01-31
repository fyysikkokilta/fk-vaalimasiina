import { globalMiddleware } from '../middleware/globalMiddleware'
import { isAuthorizedMiddleware } from '../middleware/isAuthorizedMiddleware'
import { trpcProcedure } from '../trpc'

export const adminProcedure = trpcProcedure
  .use(globalMiddleware)
  .use(isAuthorizedMiddleware)
