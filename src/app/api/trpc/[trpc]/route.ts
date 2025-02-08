import { fetchRequestHandler } from '@trpc/server/adapters/fetch'

import { createContext } from '~/trpc/context'
import { appRouter as router } from '~/trpc/routers/_app'

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router,
    createContext: (opts) => createContext({ server: false, ...opts })
  })

export { handler as GET, handler as POST }
