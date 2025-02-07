import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import jsonwebtoken from 'jsonwebtoken'

import { db } from '~/db'

const createInnerContext = () => {
  return { db }
}

export const createContext = (opts?: FetchCreateContextFnOptions) => {
  const contextInner = createInnerContext()
  if (!opts) {
    return {
      isAuthorized: true,
      ...contextInner
    }
  }
  const { req, resHeaders, info } = opts

  const authHeader = req.headers.get('authorization')

  if (authHeader) {
    const jwt = authHeader.split(' ')[1]

    try {
      const payload = jsonwebtoken.verify(jwt, process.env.JWT_SECRET!) as {
        username: string
      }

      if (payload.username === process.env.ADMIN_USERNAME) {
        return {
          req,
          resHeaders,
          info,
          isAuthorized: true,
          db
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  return {
    req,
    resHeaders,
    info,
    isAuthorized: false,
    db
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
