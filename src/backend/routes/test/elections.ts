import Election, { ElectionStatus } from '../../models/election'
import { createTestCandidates } from './candidates'

export const createTestElection = async (
  title: string,
  description: string,
  amountToElect: number,
  candidates: { name: string }[],
  status: ElectionStatus
) => {
  const newElectionData = await Election.create(
    {
      title,
      description,
      amountToElect,
      status,
    },
    { returning: true }
  )

  const newElection = newElectionData.get({ plain: true })

  await createTestCandidates(newElection.electionId, candidates)

  return newElection
}

export const changeTestElectionStatus = async (
  electionId: string,
  status: ElectionStatus
) => {
  const election = await Election.findByPk(electionId)

  if (!election) {
    return null
  }

  await election.update({ status })

  return election.get({ plain: true })
}
