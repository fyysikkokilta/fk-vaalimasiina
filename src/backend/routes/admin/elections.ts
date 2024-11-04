import EmailService from '../../emails/handler'
import Election, { ElectionStatus } from '../../models/election'
import Vote from '../../models/vote'
import Voter from '../../models/voter'

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

export const startVoting = async (electionId: string, emails: string[]) => {
  const election = await getElectionAndCheckStatus(
    electionId,
    ElectionStatus.CREATED
  )
  if (!election) {
    return null
  }

  election.update({ status: ElectionStatus.ONGOING })

  const insertedVoters = await Voter.bulkCreate(
    emails.map((email) => ({
      electionId,
      email,
      hasVoted: false,
    }))
  )

  await Promise.all(
    insertedVoters.map((voter) => {
      const voterData = voter.get({ plain: true })
      return EmailService.sendVotingMail(voterData.email, {
        election: election.get({ plain: true }),
        voterId: voterData.voterId,
      })
    })
  )

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

export const abortVoting = async (electionId: string) => {
  const election = await getElectionAndCheckStatus(
    electionId,
    ElectionStatus.ONGOING
  )
  if (!election) {
    return null
  }

  const transaction = await Election.sequelize!.transaction()

  try {
    await election.update({ status: ElectionStatus.CREATED }, { transaction })

    await Vote.destroy({ where: { electionId }, transaction, force: true })

    await Voter.destroy({ where: { electionId }, transaction, force: true })

    await transaction.commit()
  } catch (err) {
    await transaction.rollback()
    throw err
  }

  return election.get({ plain: true })
}
