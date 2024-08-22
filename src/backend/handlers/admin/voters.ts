import { Request, Response, Router } from 'express'
import {
  addVoter,
  disableVoter,
  enableVoter,
  getAllVoters,
  getActiveVoters,
  deleteVoter,
  getVotersRemaining,
} from '../../routes/admin/voters'
import { validateUuid, validateVoterCode } from '../../validation/validation'

export const handleGetVoters = async (req: Request, res: Response) => {
  try {
    const voters = await getAllVoters()
    res.status(200).json(voters)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const handleAddVoter = async (req: Request, res: Response) => {
  const { identifier } = req.body
  try {
    const result = await addVoter(identifier)

    if (!result) {
      res.status(409).json({ key: 'voter_already_exists' })
      return
    }

    res.status(200).json(result)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const handleDeleteVoter = async (req: Request, res: Response) => {
  const { identifier } = req.params
  try {
    const deletedVoter = await deleteVoter(identifier)

    if (!deletedVoter) {
      res.status(404).json({ key: 'voter_not_found' })
      return
    }

    res.status(200).json(deletedVoter)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const handleDisableVoter = async (req: Request, res: Response) => {
  const { identifier } = req.params
  try {
    const disabledVoter = await disableVoter(identifier)

    if (!disabledVoter) {
      res.status(404).json({ key: 'voter_not_found' })
      return
    }

    res.status(200).json(disabledVoter)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const handleEnableVoter = async (req: Request, res: Response) => {
  const { identifier } = req.params
  try {
    const enabledVoter = await enableVoter(identifier)

    if (!enabledVoter) {
      res.status(404).json(enabledVoter)
      return
    }

    res.status(200).json(enabledVoter)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const handleGetActiveVoterCount = async (
  req: Request,
  res: Response
) => {
  try {
    const voters = await getActiveVoters()
    res.status(200).json(voters.length)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const handleGetVotersRemaining = async (req: Request, res: Response) => {
  const { electionId } = req.params
  try {
    const voters = await getVotersRemaining(electionId)
    res.status(200).json(voters)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const router = Router()

router.get('/active/count', handleGetActiveVoterCount)

router.use('/:electionId', (req, res, next) => {
  if (!validateUuid(req.params.electionId)) {
    res.status(400).json({ key: 'invalid_election_id' })
    return
  }
  next()
})

router.get('/:electionId/remaining', handleGetVotersRemaining)

router.use('/:identifier', (req, res, next) => {
  if (!validateVoterCode(req.params.identifier)) {
    res.status(400).json({ key: 'invalid_voter_code' })
    return
  }
  next()
})

router.post('/:identifier/enable', handleEnableVoter)
router.post('/:identifier/disable', handleDisableVoter)
router.delete('/:identifier', handleDeleteVoter)

router.get('/', handleGetVoters)

router.use('/', (req, res, next) => {
  if (!validateVoterCode(req.body.identifier)) {
    res.status(400).json({ key: 'invalid_voter_code' })
    return
  }
  next()
})

router.post('/', handleAddVoter)

export default router
