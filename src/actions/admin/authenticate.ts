'use server'

import { SignJWT } from 'jose'
import { cookies } from 'next/headers'
import { getLocale, getTranslations } from 'next-intl/server'
import { z } from 'zod'

import { env } from '~/env'
import { redirect } from '~/i18n/navigation'

import { actionClient, ActionError } from '../safe-action'

const authenticateSchema = async () => {
  const t = await getTranslations('actions.authenticate.validation')
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

const createJWT = async (username: string) => {
  return await new SignJWT({ username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('fk-vaalimasiina')
    .setExpirationTime('10h')
    .sign(new TextEncoder().encode(env.JWT_SECRET))
}

export const authenticate = actionClient
  .inputSchema(authenticateSchema)
  .action(async ({ parsedInput: { username, password } }) => {
    const t = await getTranslations('actions.authenticate.action_status')
    const cookieStore = await cookies()
    const locale = await getLocale()

    if (env.NODE_ENV === 'development') {
      if (username === 'admin' && password === 'password') {
        const jwt = await createJWT(username)

        cookieStore.set('admin-token', jwt)

        redirect({
          href: '/admin',
          locale
        })

        return { message: t('login_successful') }
      }
    }

    const adminUsername = env.ADMIN_USERNAME
    const adminPassword = env.ADMIN_PASSWORD

    if (adminUsername !== username || adminPassword !== password) {
      throw new ActionError(t('wrong_username_or_password'))
    }

    const jwt = await createJWT(username)

    cookieStore.set('admin-token', jwt, {
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 8
    })

    return { message: t('login_successful') }
  })
