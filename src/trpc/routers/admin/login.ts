import { TRPCError } from '@trpc/server'
import jsonwebtoken from 'jsonwebtoken'
import { z } from 'zod'

import { router } from '../../init'
import { publicProcedure } from '../../procedures/publicProcedure'

export const adminLoginRouter = router({
  authenticate: publicProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string()
      })
    )
    .mutation(({ input }) => {
      const { username, password } = input
      const adminUsername = process.env.ADMIN_USERNAME!
      const adminPassword = process.env.ADMIN_PASSWORD!

      if (process.env.NODE_ENV === 'development') {
        if (username === 'admin' && password === 'password') {
          return jsonwebtoken.sign({ username }, process.env.JWT_SECRET!, {
            expiresIn: '10h'
          })
        }
      }

      if (adminUsername !== username || adminPassword !== password) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'wrong_username_or_password'
        })
      }

      return jsonwebtoken.sign({ username }, process.env.JWT_SECRET!, {
        expiresIn: '10h'
      })
    })
})
