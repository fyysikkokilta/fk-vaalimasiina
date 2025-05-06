import { DatabaseError } from 'pg'

const isUniqueConstraintError = (error: unknown): boolean => {
  return error instanceof DatabaseError && error.code === '23505'
}

export default isUniqueConstraintError
