'use server'

import { revalidateTag } from 'next/cache'

import { protectedAction } from '~/actions/utils/isAuthorized'

// eslint-disable-next-line @typescript-eslint/require-await
async function pollVotes() {
  revalidateTag('admin-election')
  return {
    success: true,
    message: 'votes_polled'
  }
}

export const protectedPollVotes = protectedAction(pollVotes)
