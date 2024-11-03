import { Router, Request, Response } from 'express'
import { addCandidates, modifyCandidates } from '../../routes/admin/candidates'
import { validateUuid } from '../../validation/validation'
import {
  abortVoting,
  closeElection,
  createElection,
  endVoting,
  startVoting,
  updateElection,
} from '../../routes/admin/elections'

export const handleNewElection = async (req: Request, res: Response) => {
  const { title, description, amountToElect, candidates } = req.body
  try {
    const election = await createElection(title, description, amountToElect)
    const insertedCandidates = await addCandidates(
      election.electionId,
      candidates
    )
    const insertedCandidatesPlain = insertedCandidates.map((candidate) =>
      candidate.get({ plain: true })
    )

    const electionWithCandidates = {
      ...election,
      candidates: insertedCandidatesPlain,
    }
    res.status(201).json(electionWithCandidates)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const handleModifyElection = async (req: Request, res: Response) => {
  const { electionId } = req.params
  const { title, description, amountToElect, candidates } = req.body
  try {
    const modifiedElection = await updateElection(
      electionId,
      title,
      description,
      amountToElect
    )

    if (!modifiedElection) {
      res.status(404).json({ key: 'election_not_found' })
      return
    }

    const modifiedCandidates = await modifyCandidates(electionId, candidates)

    const electionWithCandidates = {
      ...modifiedElection,
      candidates: modifiedCandidates,
    }
    res.status(200).json(electionWithCandidates)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const handleStartVoting = async (req: Request, res: Response) => {
  const { electionId } = req.params
  const { emails } = req.body
  try {
    const election = await startVoting(electionId, emails)

    if (!election) {
      res.status(404).json({ key: 'election_not_found' })
      return
    }

    res.status(200).json(election)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const handleEndVoting = async (req: Request, res: Response) => {
  const { electionId } = req.params
  try {
    const election = await endVoting(electionId)

    if (!election) {
      res.status(404).json({ key: 'election_not_found' })
      return
    }

    res.status(200).json(election)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const handleCloseElection = async (req: Request, res: Response) => {
  const { electionId } = req.params
  try {
    const election = await closeElection(electionId)

    if (!election) {
      res.status(404).json({ key: 'election_not_found' })
      return
    }

    res.status(200).json(election)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const handleAbortVoting = async (req: Request, res: Response) => {
  const { electionId } = req.params
  try {
    const election = await abortVoting(electionId)

    if (!election) {
      res.status(404).json({ key: 'election_not_found' })
      return
    }

    res.status(200).json(election)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

const router = Router()

router.use('/:electionId', (req, res, next) => {
  if (!validateUuid(req.params.electionId)) {
    res.status(400).json({ key: 'invalid_election_id' })
    return
  }
  next()
})

router.put('/:electionId', handleModifyElection)
router.post('/:electionId/start', handleStartVoting)
router.post('/:electionId/end', handleEndVoting)
router.post('/:electionId/close', handleCloseElection)
router.post('/:electionId/abort', handleAbortVoting)

router.use('/', (req, res, next) => {
  const { title, description, amountToElect, candidates } = req.body
  if (
    !title ||
    !description ||
    !amountToElect ||
    !Array.isArray(candidates) ||
    candidates.length === 0
  ) {
    res.status(400).json({ key: 'invalid_election_data' })
    return
  }

  candidates.forEach((candidate: { name: string }) => {
    if (!candidate.name) {
      res.status(400).json({ key: 'invalid_candidate_data' })
      return
    }
  })

  next()
})

router.post('/', handleNewElection)

export default router
