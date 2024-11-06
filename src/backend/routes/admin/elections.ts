import { CreationAttributes } from 'sequelize'
import EmailService from '../../emails/handler'
import Ballot from '../../models/ballot'
import Candidate from '../../models/candidate'
import Election, { ElectionStatus } from '../../models/election'
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
  amountToElect: number,
  candidates: { name: string }[]
) => {
  const newElection = await Election.create(
    {
      title,
      description,
      amountToElect,
      status: ElectionStatus.CREATED,
      candidates: candidates.map((candidate) => ({
        name: candidate.name,
      })),
    } as CreationAttributes<Election>,
    {
      returning: true,
      include: {
        model: Candidate,
        as: 'candidates',
      }
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

    await Ballot.destroy({ where: { electionId }, transaction })

    await Voter.destroy({ where: { electionId }, transaction })

    await transaction.commit()
  } catch (err) {
    await transaction.rollback()
    throw err
  }

  return election.get({ plain: true })
}
