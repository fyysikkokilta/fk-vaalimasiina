import { HasVoted } from '../../models/hasVoted'
import Voter from '../../models/voter'
import { isElectionOngoing } from './elections'

export const getAllVoters = async () => {
  return Voter.findAll()
}

const checkIsElectionOngoingAndGetVoter = async (identifier: string) => {
  if (await isElectionOngoing()) {
    return null
  }

  return Voter.findOne({
    where: { identifier },
  })
}

export const addVoter = async (identifier: string) => {
  if (await isElectionOngoing()) {
    return null
  }

  const newVoter = await Voter.create(
    {
      identifier,
      loggedIn: false,
      active: true,
      alias: '',
    },
    { returning: true }
  )

  return newVoter.get({ plain: true })
}

export const deleteVoter = async (identifier: string) => {
  const voter = await checkIsElectionOngoingAndGetVoter(identifier)

  if (!voter) {
    return null
  }

  await voter.destroy()

  return voter.get({ plain: true })
}

export const disableVoter = async (identifier: string) => {
  const voter = await checkIsElectionOngoingAndGetVoter(identifier)

  if (!voter) {
    return null
  }

  await voter.update({ loggedIn: false, active: false, alias: '' })

  return voter.get({ plain: true })
}

export const enableVoter = async (identifier: string) => {
  const voter = await checkIsElectionOngoingAndGetVoter(identifier)

  if (!voter) {
    return null
  }

  await voter.update({ active: true })

  return voter.get({ plain: true })
}

export const getActiveVoters = async () => {
  return Voter.findAll({
    where: { active: true },
  })
}

export const getVotersWhoVoted = async (electionId: string) => {
  return HasVoted.findAll({
    where: { electionId },
  })
}

export const getVotersRemaining = async (electionId: string) => {
  const activeVoters = await getActiveVoters()
  const alreadyVotedVoters = await getVotersWhoVoted(electionId)

  const remainingVoters = activeVoters.filter(
    (voter) =>
      !alreadyVotedVoters.find(
        (v) =>
          v.get({ plain: true }).voterId === voter.get({ plain: true }).voterId
      )
  )

  return remainingVoters.map((v) => v.get({ plain: true }))
}
