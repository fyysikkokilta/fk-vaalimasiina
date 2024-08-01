import Candidate from '../models/candidate'
import Election, { ElectionStatus } from '../models/election'

export const getElections = async () => {
  const elections = await Election.findAll({
    include: [
      {
        model: Candidate,
        as: 'candidates',
      },
    ],
  })
  return elections.map((election) => election.get({ plain: true }))
}

export const getElectionById = async (electionId: string) => {
  const election = await Election.findByPk(electionId)
  if (!election) {
    return null
  }

  return election.get({ plain: true })
}

export const isNoElectionOngoing = async (electionId: string) => {
  const ongoingElection = await Election.findOne({
    where: { electionId, status: ElectionStatus.ONGOING },
  })

  return !ongoingElection
}
