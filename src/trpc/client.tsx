'use client'
// ^-- to make sure we cant mount the Provider from a server component
import type { QueryClient } from '@tanstack/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import {
  createTRPCClient,
  httpBatchLink,
  loggerLink,
  TRPCClientError
} from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import Cookies from 'universal-cookie'

import { makeQueryClient } from './query-client'
import type { AppRouter, TestRouter } from './routers/_app'

export const trpc = createTRPCReact<AppRouter>()

let clientQueryClientSingleton: QueryClient

function getQueryClient(t: (key: string) => string) {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient()
  }
  // Browser: use singleton pattern to keep the same query client
  return (clientQueryClientSingleton ??= makeQueryClient(t))
}

function getUrl() {
  const base = (() => {
    if (typeof window !== 'undefined') return ''
    return 'http://localhost:3000'
  })()
  return `${base}/api/trpc`
}

export function TRPCProvider(
  props: Readonly<{
    children: React.ReactNode
  }>
) {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const errorT = useTranslations('errors')
  const queryClient = getQueryClient(errorT)
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV !== 'production' ||
            (opts.direction === 'down' && opts.result instanceof Error)
        }),
        httpBatchLink({
          url: getUrl(),
          headers() {
            const cookies = new Cookies()
            const adminToken = cookies.get('admin-token') as string | undefined

            return {
              authorization: adminToken ? `Bearer ${adminToken}` : ''
            }
          }
        })
      ]
    })
  )
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </trpc.Provider>
  )
}

export const testClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/api/trpc',
      headers() {
        const cookies = new Cookies()
        const adminToken = cookies.get('admin-token') as string | undefined

        return {
          authorization: adminToken ? `Bearer ${adminToken}` : ''
        }
      }
    })
  ]
})

export function isTRPCClientError(
  cause: unknown
): cause is TRPCClientError<AppRouter> {
  return cause instanceof TRPCClientError
}

export type RouterInput = inferRouterInputs<AppRouter>
export type RouterOutput = inferRouterOutputs<AppRouter>

export type TestRouterInput = inferRouterInputs<TestRouter>
export type TestRouterOutput = inferRouterOutputs<TestRouter>
