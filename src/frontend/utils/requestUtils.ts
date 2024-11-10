import { t } from 'i18next'

export const getErrorMessage = async (response: Response) => {
  try {
    const body = (await response.json()) as { key?: string; message?: string }

    if (body.key) {
      return t(`errors.${body.key}`)
    }

    if (body.message) {
      return body.message
    }
  } catch (e) {
    console.error(e)
    return response.statusText
  }

  return response.statusText
}
