'use server'

import { revalidateTag } from 'next/cache'

import { isAuthorizedMiddleware } from '~/actions/middleware/isAuthorized'
import { actionClient } from '~/actions/safe-action'

export const pollVotes = actionClient
  .use(isAuthorizedMiddleware)
  // eslint-disable-next-line @typescript-eslint/require-await
  .action(async () => {
    revalidateTag('admin-election')
    return { message: 'votes_polled' }
  })
