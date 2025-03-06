'use server'

import jsonwebtoken from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import { z } from 'zod'

import { actionClient, ActionError } from '../safe-action'

const authenticateSchema = async () => {
  const t = await getTranslations('admin.login.validation')
  return z.object({
    username: z
      .string({
        message: t('username_string')
      })
      .nonempty({
        message: t('username_nonempty')
      }),
    password: z
      .string({
        message: t('password_string')
      })
      .nonempty({ message: t('password_nonempty') })
  })
}

export const authenticate = actionClient
  .schema(authenticateSchema)
  .action(async ({ parsedInput: { username, password } }) => {
    const t = await getTranslations('admin.login')
    const cookieStore = await cookies()

    if (process.env.NODE_ENV === 'development') {
      if (username === 'admin' && password === 'password') {
        const jwt = jsonwebtoken.sign({ username }, process.env.JWT_SECRET!, {
          expiresIn: '10h'
        })
        cookieStore.set('admin-token', jwt)

        return { message: t('login_successful') }
      }
    }

    const adminUsername = process.env.ADMIN_USERNAME!
    const adminPassword = process.env.ADMIN_PASSWORD!

    if (adminUsername !== username || adminPassword !== password) {
      throw new ActionError(t('wrong_username_or_password'))
    }

    const jwt = jsonwebtoken.sign({ username }, process.env.JWT_SECRET!, {
      expiresIn: '10h'
    })

    cookieStore.set('admin-token', jwt, {
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 8
    })

    return { message: t('login_successful') }
  })
