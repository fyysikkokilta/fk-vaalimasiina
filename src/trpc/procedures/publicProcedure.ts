import { trpcProcedure } from '../init'
import { globalMiddleware } from '../middleware/globalMiddleware'

export const publicProcedure = trpcProcedure.use(globalMiddleware)
