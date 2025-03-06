import { cookies } from 'next/headers'
import { getLocale } from 'next-intl/server'
import { MiddlewareResult } from 'next-safe-action'

import { redirect } from '~/i18n/navigation'
import isAuthorized from '~/utils/isAuthorized'

import { ActionError } from '../safe-action'

export const isAuthorizedMiddleware = async ({
  next
}: {
  next: <NC extends object>(opts?: {
    ctx?: NC | undefined
  }) => Promise<MiddlewareResult<string, NC>>
}) => {
  const cookieStore = await cookies()
  const adminToken = cookieStore.get('admin-token')
  const authorized = isAuthorized(adminToken?.value)

  if (!authorized) {
    const locale = await getLocale()
    redirect({
      href: '/login',
      locale
    })
    throw new ActionError('unauthorized')
  }
  return next()
}
