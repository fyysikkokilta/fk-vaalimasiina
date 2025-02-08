import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import jsonwebtoken from 'jsonwebtoken'
import { cookies } from 'next/headers'

import { db } from '~/db'

const createInnerContext = () => {
  return { db }
}

const getIsAuthorized = (jwt: string) => {
  try {
    const payload = jsonwebtoken.verify(jwt, process.env.JWT_SECRET!) as {
      username: string
    }

    return payload.username === process.env.ADMIN_USERNAME
  } catch {
    return false
  }
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
    const isAuthorized = jwt ? getIsAuthorized(jwt) : false

    return {
      isAuthorized,
      ...contextInner
    }
  }

  const { req, resHeaders, info } = opts
  const authHeader = req.headers.get('authorization')
  const jwt = authHeader?.split(' ')[1]
  const isAuthorized = jwt ? getIsAuthorized(jwt) : false

  return {
    req,
    resHeaders,
    info,
    isAuthorized,
    ...contextInner
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
