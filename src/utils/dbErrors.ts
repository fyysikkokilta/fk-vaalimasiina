export const isPgUniqueViolation = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') {
    return false
  }

  if ('code' in error && (error as { code?: unknown }).code === '23505') {
    return true
  }

  const cause = (error as { cause?: unknown }).cause
  if (!cause || typeof cause !== 'object') {
    return false
  }

  return 'code' in cause && (cause as { code?: unknown }).code === '23505'
}
