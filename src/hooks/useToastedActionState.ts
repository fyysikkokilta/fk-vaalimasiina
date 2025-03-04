import { useTranslations } from 'next-intl'
import { useActionState, useEffect } from 'react'
import { toast } from 'react-toastify'

export function useToastedActionState<
  S extends {
    success: boolean
    message: string
  },
  Payload
>(
  action: (state: Awaited<S>, payload: Payload) => S | Promise<S>,
  stateOptions: Awaited<S>,
  TComponent?: string,
  successCallback?: () => void,
  errorCallback?: () => void
): [S, (payload: Payload) => void, boolean] {
  const t = useTranslations(TComponent || 'toasts')
  const [state, formAction, pending] = useActionState<S, Payload>(
    action,
    stateOptions
  )

  useEffect(() => {
    if (pending) return
    if (state.success) {
      toast.success(t(state.message))
      successCallback?.()
    } else if (state.message) {
      toast.error(t(state.message))
      errorCallback?.()
    }
  }, [errorCallback, pending, state, successCallback, t])

  return [state, formAction, pending]
}
