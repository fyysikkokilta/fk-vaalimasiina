import {
  createTRPCClient,
  httpBatchLink,
  TRPCClientError,
  TRPCLink
} from '@trpc/client'
import { createTRPCReact } from '@trpc/react-query'
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import { observable } from '@trpc/server/observable'
import { exists, t } from 'i18next'
import { Cookies } from 'react-cookie'
import { toast } from 'react-toastify'

import type { AppRouter, TestRouter } from '../../backend/server'

export const errorLink: TRPCLink<AppRouter> = () => {
  return ({ next, op }) => {
    return observable((observer) => {
      const unsubscribe = next(op).subscribe({
        next(value) {
          observer.next(value)
        },
        error(err) {
          observer.error(err)
          if (exists(`errors.${err.message}`)) {
            toast.error(t(`errors.${err.message}`))
          } else {
            toast.error(t('errors.generic_fetch_error'))
          }
          const isAdmin = err.data?.path?.includes('admin')
          const shouldLogout =
            err.data?.code === 'UNAUTHORIZED' || err.data?.code === 'FORBIDDEN'
          if (isAdmin && shouldLogout) {
            // Remove admin token if it's invalid or expired
            const cookies = new Cookies()
            cookies.remove('admin-token')
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

export const testClient = createTRPCClient<AppRouter>({
  links: [
    errorLink,
    httpBatchLink({
      url: 'http://localhost:3000/trpc',
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

export const trpc = createTRPCReact<AppRouter>()

export function isTRPCClientError(
  cause: unknown
): cause is TRPCClientError<AppRouter> {
  return cause instanceof TRPCClientError
}

export type RouterInput = inferRouterInputs<AppRouter>
export type RouterOutput = inferRouterOutputs<AppRouter>

export type TestRouterInput = inferRouterInputs<TestRouter>
export type TestRouterOutput = inferRouterOutputs<TestRouter>
