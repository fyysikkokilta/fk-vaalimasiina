import 'server-only' // <-- ensure this file cannot be imported from the client

import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'
import { cache } from 'react'

import { createContext } from './context'
import { makeQueryClient } from './query-client'
import { appRouter } from './routers/_app'

export const getQueryClient = cache(makeQueryClient)

export const trpc = createTRPCOptionsProxy({
  ctx: () => createContext({ server: true }),
  router: appRouter,
  queryClient: getQueryClient
})

export const caller = appRouter.createCaller(() =>
  createContext({ server: true })
)
