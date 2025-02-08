import { trpcProcedure } from '../init'
import { globalMiddleware } from '../middleware/globalMiddleware'
import { isTestMiddleware } from '../middleware/isTestMiddleware'

export const testProcedure = trpcProcedure
  .use(globalMiddleware)
  .use(isTestMiddleware)
