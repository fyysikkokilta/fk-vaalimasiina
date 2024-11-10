import { Router, Request, Response } from 'express'
import { validateUuid } from '../../validation/validation'
import {
  abortVoting,
  closeElection,
  createElection,
  endVoting,
  startVoting,
  updateElection
} from '../../routes/admin/elections'
import { RequestBody, RequestBodyParams } from '../../../../types/express'

export type NewElectionRequestBody = {
  title: string
  description: string
  seats: number
  candidates: { name: string }[]
}
export const handleNewElection = async (
  req: RequestBody<NewElectionRequestBody>,
  res: Response
) => {
  const { title, description, seats, candidates } = req.body
  try {
    const election = await createElection(title, description, seats, candidates)

    res.status(201).json(election)
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message })
    }
  }
}

export type ModifyElectionRequestParams = {
  electionId: string
}
export const handleModifyElection = async (
  req: RequestBodyParams<NewElectionRequestBody, ModifyElectionRequestParams>,
  res: Response
) => {
  const { electionId } = req.params
  const { title, description, seats, candidates } = req.body
  try {
    const modifiedElection = await updateElection(
      electionId,
      title,
      description,
      seats,
      candidates
    )

    if (!modifiedElection) {
      res.status(404).json({ key: 'election_not_found' })
      return
    }

    res.status(200).json(modifiedElection)
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message })
    }
  }
}

export type StartVotingRequestBody = {
  emails: string[]
}
export type StartVotingRequestParams = {
  electionId: string
}
export const handleStartVoting = async (
  req: RequestBodyParams<StartVotingRequestBody, StartVotingRequestParams>,
  res: Response
) => {
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
    if (err instanceof Error) {
      res.status(500).json({ message: err.message })
    }
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
    if (err instanceof Error) {
      res.status(500).json({ message: err.message })
    }
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
    if (err instanceof Error) {
      res.status(500).json({ message: err.message })
    }
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
    if (err instanceof Error) {
      res.status(500).json({ message: err.message })
    }
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

router.use('/', (req: RequestBody<NewElectionRequestBody>, res, next) => {
  const { title, description, seats, candidates } = req.body
  if (
    !title ||
    !description ||
    !seats ||
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
