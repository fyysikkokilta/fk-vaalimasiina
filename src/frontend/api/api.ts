import Cookies from 'universal-cookie'
import { getErrorMessage } from '../utils/requestUtils'
import { toast } from 'react-toastify'

type ApiResponse<T> =
  | {
      ok: true
      status: number
      data: T
    }
  | {
      ok: false
      status: number
      message: string
    }

export const api = async <T>(
  url: string,
  init?: RequestInit,
  toastError: boolean = true
): Promise<ApiResponse<T>> => {
  const cookies = new Cookies()
  const adminToken = cookies.get('admin-token')

  const headers = new Headers({
    ...(init?.headers || {}),
    Authorization: adminToken ? `Bearer ${adminToken}` : '',
  })

  init = {
    ...init,
    headers,
  }
  const response = await fetch(url, init)

  if (!response.ok) {
    if (toastError) {
      toast.error(await getErrorMessage(response))
    }

    if (url.startsWith('/api/admin')) {
      // Remove admin token if it's invalid or expired
      cookies.remove('admin-token')
    }

    return {
      ok: false,
      status: response.status,
      message: await getErrorMessage(response),
    }
  }

  return {
    ok: true,
    status: response.status,
    data: await response.json(),
  }
}
