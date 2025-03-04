import { cookies } from 'next/headers'
import { getLocale } from 'next-intl/server'

import { redirect } from '~/i18n/navigation'
import isAuthorized from '~/utils/isAuthorized'

export type ServerFunction<T extends unknown[], R> = (...args: T) => Promise<R>

export function protectedAction<T extends unknown[], R>(
  fn: ServerFunction<T, R>
) {
  return async (...args: T) => {
    const cookieStore = await cookies()
    const adminToken = cookieStore.get('admin-token')
    const authorized = isAuthorized(adminToken?.value)

    if (!authorized) {
      const locale = await getLocale()
      redirect({
        href: '/login',
        locale
      })
      return {
        success: false,
        message: 'unauthorized'
      }
    }

    return fn(...args)
  }
}
