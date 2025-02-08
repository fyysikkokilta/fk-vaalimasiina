import 'server-only' // <-- ensure this file cannot be imported from the client

import { createHydrationHelpers } from '@trpc/react-query/rsc'
import { cache } from 'react'

import { createContext } from './context'
import { createCallerFactory } from './init'
import { makeQueryClient } from './query-client'
import { appRouter } from './routers/_app'

export const getQueryClient = cache(makeQueryClient)
const caller = createCallerFactory(appRouter)(() =>
  createContext({ server: true })
)
export const { trpc, HydrateClient } = createHydrationHelpers<typeof appRouter>(
  caller,
  getQueryClient
)
