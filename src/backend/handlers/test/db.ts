import { Request, Response, Router } from 'express'
import { resetDatabase } from '../../routes/test/db'

export const handleResetDatabase = async (_req: Request, res: Response) => {
  try {
    await resetDatabase()
    res.status(200).json({ message: 'Database reset successfully' })
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message })
    }
  }
}

const router = Router()

router.post('/', handleResetDatabase)

export default router
