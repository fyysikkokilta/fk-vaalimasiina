import { Request, Response, Router } from 'express'
import { createTestVoter, disableTestVoter, enableTestVoter, loginTestVoter, logoutTestVoter } from '../../routes/test/voter'

export const handleCreateTestVoter = async (req: Request, res: Response) => {
  const { identifier, alias } = req.body

  try {
    const voter = await createTestVoter(identifier, alias)
    res.status(201).json(voter)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const handleLoginTestVoter = async (req: Request, res: Response) => {
  const { identifier } = req.body

  try {
    const voter = await loginTestVoter(identifier)
    res.status(200).json(voter)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const handleLogoutTestVoter = async (req: Request, res: Response) => {
  const { voterId } = req.params

  try {
    const voter = await logoutTestVoter(voterId)
    res.status(200).json(voter)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const handleDisableTestVoter = async (req: Request, res: Response) => {
  const { voterId } = req.params

  try {
    const voter = await disableTestVoter(voterId)
    res.status(200).json(voter)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const handleEnableTestVoter = async (req: Request, res: Response) => {
  const { voterId } = req.params

  try {
    const voter = await enableTestVoter(voterId)
    res.status(200).json(voter)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const router = Router()

router.post('/', handleCreateTestVoter)
router.post('/login', handleLoginTestVoter)
router.put('/:voterId/logout', handleLogoutTestVoter)
router.put('/:voterId/disable', handleDisableTestVoter)
router.put('/:voterId/enable', handleEnableTestVoter)

export default router