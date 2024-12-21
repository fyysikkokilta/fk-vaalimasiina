export const validateUuid = (uuid: string) => {
  const matches = uuid.match(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
  )

  return matches !== null
}

export const validateEmail = (email: string) => {
  const matches = email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)

  return matches !== null
}
