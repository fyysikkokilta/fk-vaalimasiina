'use server'

import { revalidatePath } from 'next/cache'

import { isAuthorizedMiddleware } from '~/actions/middleware/isAuthorized'
import { actionClient } from '~/actions/safe-action'
import { getActionsTranslations } from '~/actions/utils/getActionsTranslations'

export const pollVotes = actionClient
  .use(isAuthorizedMiddleware)
  .action(async () => {
    const t = await getActionsTranslations('actions.pollVotes.action_status')
    revalidatePath('/[locale]/admin', 'page')
    return { message: t('votes_polled') }
  })
