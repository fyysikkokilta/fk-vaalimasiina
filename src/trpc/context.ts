import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import { cookies } from 'next/headers'

import { db } from '~/db'
import isAuthorized from '~/utils/isAuthorized'

const createInnerContext = () => {
  return { db }
}

type CreateContextOptions =
  | {
      server: true
    }
  | ({
      server: false
    } & FetchCreateContextFnOptions)

export const createContext = async (opts: CreateContextOptions) => {
  const contextInner = createInnerContext()
  const { server } = opts

  if (server) {
    const cookiesData = await cookies()
    const jwt = cookiesData.get('admin-token')?.value
    const authorized = isAuthorized(jwt)

    return {
      authorized,
      ...contextInner
    }
  }

  const { req, resHeaders, info } = opts
  const authHeader = req.headers.get('authorization')
  const jwt = authHeader?.split(' ')[1]
  const authorized = isAuthorized(jwt)

  return {
    req,
    resHeaders,
    info,
    authorized,
    ...contextInner
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
