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
  if (await checkIsElectionOngoingAndGetVoter(identifier)) {
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
