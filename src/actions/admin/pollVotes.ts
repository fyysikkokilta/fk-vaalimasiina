'use server'

import { revalidatePath } from 'next/cache'
import { getTranslations } from 'next-intl/server'

import { isAuthorizedMiddleware } from '~/actions/middleware/isAuthorized'
import { actionClient } from '~/actions/safe-action'

export const pollVotes = actionClient
  .use(isAuthorizedMiddleware)
  .action(async () => {
    const t = await getTranslations('actions.pollVotes.action_status')
    revalidatePath('/[locale]/admin', 'page')
    return { message: t('votes_polled') }
  })
