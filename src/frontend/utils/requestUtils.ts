export const getErrorMessage = async (response: Response) => {
  try {
    const body = await response.json()

    if (body.message) {
      return body.message as string
    }
  } catch (e) {
    return response.statusText
  }

  return response.statusText
}
