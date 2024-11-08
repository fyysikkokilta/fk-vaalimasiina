import { Request, Response, Router } from 'express'
import { resetDatabase } from '../../routes/test/db'

export const handleResetDatabase = async (req: Request, res: Response) => {
  try {
    await resetDatabase()
    res.status(200).json({ message: 'Database reset successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const router = Router()

router.post('/', handleResetDatabase)

export default router
