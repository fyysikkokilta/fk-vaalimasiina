import { Request, Response, Router } from 'express'

import { RequestBody } from '../../../../types/express'
import { changeVoterEmail, getVoters } from '../../routes/admin/voters'
import { validateUuid } from '../../validation/validation'

export type ChangeVoterEmailRequestBody = {
  oldEmail: string
  newEmail: string
}
export const handleChangeVoterEmail = async (
  req: RequestBody<ChangeVoterEmailRequestBody>,
  res: Response
) => {
  const { oldEmail, newEmail } = req.body
  try {
    const voter = await changeVoterEmail(oldEmail, newEmail)
    if (!voter) {
      res.status(404).json({ key: 'voter_not_found' })
      return
    }
    res.status(200).json(voter)
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message })
    }
  }
}

export const handleGetVoters = async (req: Request, res: Response) => {
  const { electionId } = req.params
  try {
    const voters = await getVoters(electionId)
    res.status(200).json(voters)
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

router.get('/:electionId', handleGetVoters)

router.use('/', (req: RequestBody<ChangeVoterEmailRequestBody>, res, next) => {
  if (!req.body.oldEmail) {
    res.status(400).json({ key: 'missing_old_email' })
    return
  }
  if (!req.body.newEmail) {
    res.status(400).json({ key: 'missing_new_email' })
    return
  }
  next()
})

router.put('/', handleChangeVoterEmail)

export default router
