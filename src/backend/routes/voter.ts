import Voter from '../models/voter'

export const getVoterStatus = async (voterId: string) => {
  const voterData = await Voter.findOne({
    where: { voterId },
    attributes: ['loggedIn', 'active'],
  })
  if (!voterData) {
    return null
  }
  const voter = voterData?.get({ plain: true })

  return { loggedIn: voter.loggedIn, active: voter.active }
}

export const getVoterStatusWithIdentifier = async (identifier: string) => {
  const voterData = await Voter.findOne({
    where: { identifier },
    attributes: ['loggedIn', 'active'],
  })
  if (!voterData) {
    return null
  }
  const voter = voterData?.get({ plain: true })

  return { loggedIn: voter.loggedIn, active: voter.active }
}
