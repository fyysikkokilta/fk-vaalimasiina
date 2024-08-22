import { t } from 'i18next'

export const getErrorMessage = async (response: Response) => {
  try {
    const body = await response.json()

    if (body.key) {
      return t(`errors.${body.key}`)
    }

    if (body.message) {
      return body.message as string
    }
  } catch (e) {
    return response.statusText
  }

  return response.statusText
}
