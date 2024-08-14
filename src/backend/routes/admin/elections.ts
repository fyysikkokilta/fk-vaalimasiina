import Election, { ElectionStatus } from '../../models/election'

export const getElectionAndCheckStatus = async (
  electionId: string,
  status: ElectionStatus
) => {
  const election = await Election.findByPk(electionId)
  if (!election) {
    return null
  }

  if (election.get('status', { plain: true }) !== status) {
    return null
  }

  return election
}

export const isElectionOngoing = async () => {
  const ongoingElection = await Election.findOne({
    where: { status: ElectionStatus.ONGOING },
  })

  return !!ongoingElection
}

export const createElection = async (
  title: string,
  description: string,
  amountToElect: number
) => {
  const newElection = await Election.create(
    {
      title,
      description,
      amountToElect,
      status: ElectionStatus.CREATED,
    },
    {
      returning: true,
    }
  )

  return newElection.get({ plain: true })
}

export const updateElection = async (
  electionId: string,
  title: string,
  description: string,
  amountToElect: number
) => {
  const election = await getElectionAndCheckStatus(
    electionId,
    ElectionStatus.CREATED
  )
  if (!election) {
    return null
  }

  election.update({ title, description, amountToElect })

  return election.get({ plain: true })
}

export const startVoting = async (electionId: string) => {
  const election = await getElectionAndCheckStatus(
    electionId,
    ElectionStatus.CREATED
  )
  if (!election) {
    return null
  }

  election.update({ status: ElectionStatus.ONGOING })

  return election.get({ plain: true })
}

export const endVoting = async (electionId: string) => {
  const election = await getElectionAndCheckStatus(
    electionId,
    ElectionStatus.ONGOING
  )
  if (!election) {
    return null
  }

  election.update({ status: ElectionStatus.FINISHED })

  return election.get({ plain: true })
}

export const closeElection = async (electionId: string) => {
  const election = await getElectionAndCheckStatus(
    electionId,
    ElectionStatus.FINISHED
  )
  if (!election) {
    return null
  }

  election.update({ status: ElectionStatus.CLOSED })

  return election.get({ plain: true })
}
