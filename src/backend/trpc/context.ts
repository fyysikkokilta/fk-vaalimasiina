import { CreateExpressContextOptions } from '@trpc/server/adapters/express'
import jsonwebtoken from 'jsonwebtoken'

import { db } from '../db'
import EmailService from '../emails/handler'

export const createContext = (opts: CreateExpressContextOptions) => {
  const { req, res } = opts

  const authHeader = req.headers.authorization

  if (authHeader) {
    const jwt = authHeader.split(' ')[1]

    try {
      const payload = jsonwebtoken.verify(jwt, process.env.JWT_SECRET!) as {
        username: string
      }

      if (payload.username === process.env.ADMIN_USERNAME) {
        return {
          req,
          res,
          isAuthorized: true,
          db,
          emailService: EmailService
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  return {
    req,
    res,
    isAuthorized: false,
    db,
    emailService: EmailService
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
