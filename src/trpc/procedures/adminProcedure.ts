import { trpcProcedure } from '../init'
import { globalMiddleware } from '../middleware/globalMiddleware'
import { isAuthorizedMiddleware } from '../middleware/isAuthorizedMiddleware'

export const adminProcedure = trpcProcedure
  .use(globalMiddleware)
  .use(isAuthorizedMiddleware)
