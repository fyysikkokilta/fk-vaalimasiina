import postgres from 'postgres'

const isUniqueConstraintError = (error: unknown): boolean => {
  /** https://github.com/porsager/postgres/pull/901 */
  return error instanceof postgres.PostgresError && error.code === '23505'
}

export default isUniqueConstraintError
