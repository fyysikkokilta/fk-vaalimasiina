import { createSafeActionClient } from 'next-safe-action'

export class ActionError extends Error {}

export const actionClient = createSafeActionClient({
  handleServerError: (error) => {
    if (error instanceof ActionError) {
      return error.message
    }

    console.error('Unhandled server error:', error)
    return error.message
  },
  defaultValidationErrorsShape: 'flattened'
})
