import Voter from '../models/voter'

export const logout = async (voterId: string) => {
  // Hash the identifier
  const voter = (await Voter.findOne({
    where: { voterId },
  }))!

  const loggedOutVoter = await voter.update({
    loggedIn: false,
    alias: '',
  })

  return loggedOutVoter.get({ plain: true })
}

export const login = async (identifier: string, alias: string) => {
  // Hash the identifier
  const voter = (await Voter.findOne({
    where: { identifier },
  }))!

  const loggedInVoter = await voter.update({
    loggedIn: true,
    alias: alias,
  })

  return loggedInVoter.get({ plain: true })
}
