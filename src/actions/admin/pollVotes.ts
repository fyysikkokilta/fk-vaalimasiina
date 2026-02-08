'use server'

import { revalidatePath } from 'next/cache'

import { isAuthorizedMiddleware } from '~/actions/middleware/isAuthorized'
import { actionClient } from '~/actions/safe-action'

export const pollVotes = actionClient.use(isAuthorizedMiddleware).action(async () => {
  revalidatePath('/[locale]/admin', 'page')
  return { message: 'Votes polled' }
})
