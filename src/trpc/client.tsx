'use client'
// ^-- to make sure we cant mount the Provider from a server component
import type { QueryClient } from '@tanstack/react-query'
import { QueryClientProvider } from '@tanstack/react-query'
import {
  createTRPCClient,
  httpBatchLink,
  loggerLink,
  TRPCClientError,
  TRPCLink
} from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import { observable } from '@trpc/server/observable'
import { deleteCookie, getCookie } from 'cookies-next/client'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'react-toastify'

import { makeQueryClient } from './query-client'
import type { AppRouter, TestRouter } from './routers/_app'

export const trpc = createTRPCReact<AppRouter>()

let clientQueryClientSingleton: QueryClient

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient()
  }
  // Browser: use singleton pattern to keep the same query client
  return (clientQueryClientSingleton ??= makeQueryClient())
}

function getUrl() {
  const base = (() => {
    if (typeof window !== 'undefined') return ''
    return 'http://localhost:3000'
  })()
  return `${base}/api/trpc`
}

export const errorLink: (
  t: ReturnType<typeof useTranslations>
) => TRPCLink<AppRouter> = (t: ReturnType<typeof useTranslations>) => () => {
  return ({ next, op }) => {
    return observable((observer) => {
      const unsubscribe = next(op).subscribe({
        next(value) {
          observer.next(value)
        },
        error(err) {
          observer.error(err)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (t.has(err.message as any)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            toast.error(t(err.message as any))
          } else {
            toast.error(t('generic_error'))
          }
          const isAdmin = err.data?.path?.includes('admin')
          const shouldLogout = err.data?.code === 'UNAUTHORIZED'
          if (isAdmin && shouldLogout) {
            deleteCookie('admin-token')
          }
        },
        complete() {
          observer.complete()
        }
      })
      return unsubscribe
    })
  }
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
  const queryClient = getQueryClient()
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        errorLink(errorT),
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV !== 'production' ||
            (opts.direction === 'down' && opts.result instanceof Error)
        }),
        httpBatchLink({
          url: getUrl(),
          headers() {
            const adminToken = getCookie('admin-token')

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
        const adminToken = getCookie('admin-token')

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
