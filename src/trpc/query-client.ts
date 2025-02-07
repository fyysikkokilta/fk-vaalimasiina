import {
  defaultShouldDehydrateQuery,
  MutationCache,
  QueryCache,
  QueryClient
} from '@tanstack/react-query'
import { toast } from 'react-toastify'
import superjson from 'superjson'
import Cookies from 'universal-cookie'

import { isTRPCClientError } from './client'

export function makeQueryClient(t?: (key: string) => string) {
  const queryCache =
    t &&
    new QueryCache({
      onError: (error) => {
        if (isTRPCClientError(error)) {
          const code = error.data?.code
          const tMessage =
            t(error.message) !== `errors.${error.message}`
              ? t(error.message)
              : error.message
          toast.error(tMessage)

          if (code === 'UNAUTHORIZED') {
            const cookies = new Cookies()
            cookies.remove('admin-token')
          }

          if (code === 'INTERNAL_SERVER_ERROR') {
            console.error(error)
          }
        }
      }
    })
  const mutationCache =
    t &&
    new MutationCache({
      onError: (error) => {
        if (isTRPCClientError(error)) {
          const code = error.data?.code
          const tMessage =
            t(error.message) !== `errors.${error.message}`
              ? t(error.message)
              : error.message
          toast.error(tMessage)

          if (code === 'UNAUTHORIZED') {
            const cookies = new Cookies()
            cookies.remove('admin-token')
          }

          if (code === 'INTERNAL_SERVER_ERROR') {
            console.error(error)
          }
        }
      }
    })
  return new QueryClient({
    queryCache,
    mutationCache,
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000
      },
      dehydrate: {
        serializeData: superjson.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === 'pending'
      },
      hydrate: {
        deserializeData: superjson.deserialize
      }
    }
  })
}
