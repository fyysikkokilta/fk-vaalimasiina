import { cookies } from 'next/headers'
import { createMiddleware } from 'next-safe-action'

import { ActionError } from '~/actions/safe-action'
import { getActionsTranslations } from '~/actions/utils/getActionsTranslations'
import isAuthorized, { JWT_COOKIE } from '~/utils/isAuthorized'

export const isAuthorizedMiddleware = createMiddleware().define(
  async ({ next }) => {
    try {
      const cookieStore = await cookies()
      const adminToken = cookieStore.get(JWT_COOKIE)
      const authorized = await isAuthorized(adminToken?.value)

      if (!authorized) {
        const t = await getActionsTranslations('actions.isAuthorized')

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

      const t = await getActionsTranslations('actions.isAuthorized')
      throw new ActionError(t('unauthorized'))
    }
  }
)
