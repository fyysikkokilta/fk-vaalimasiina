import { cookies } from 'next/headers'
import { getLocale, getTranslations } from 'next-intl/server'
import { createMiddleware } from 'next-safe-action'

import { redirect } from '~/i18n/navigation'
import isAuthorized from '~/utils/isAuthorized'

import { ActionError } from '../safe-action'

export const isAuthorizedMiddleware = createMiddleware().define(
  async ({ next }) => {
    try {
      const cookieStore = await cookies()
      const adminToken = cookieStore.get('admin-token')
      const authorized = await isAuthorized(adminToken?.value)

      if (!authorized) {
        const locale = await getLocale()
        const t = await getTranslations('actions.isAuthorized')

        redirect({
          href: '/login',
          locale
        })

        throw new ActionError(t('unauthorized'))
      }

      return next()
    } catch (error) {
      if (error instanceof ActionError) {
        throw error
      }

      if (process.env.NODE_ENV === 'development') {
        console.error('Authorization middleware error:', error)
      }

      const t = await getTranslations('actions.isAuthorized')
      throw new ActionError(t('unauthorized'))
    }
  }
)
