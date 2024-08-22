import Voter from '../../models/voter'

export const createTestVoter = async (identifier: string, alias: string) => {
  const newVoter = await Voter.create(
    {
      identifier,
      loggedIn: false,
      active: true,
      alias,
    },
    { returning: true }
  )

  return newVoter.get({ plain: true })
}

export const loginTestVoter = async (identifier: string) => {
  const voter = await Voter.findOne({
    where: { identifier },
  })

  if (!voter) {
    return null
  }

  await voter.update({ loggedIn: true })

  return voter.get({ plain: true })
}

export const logoutTestVoter = async (identifier: string) => {
  const voter = await Voter.findOne({
    where: { identifier },
  })

  if (!voter) {
    return null
  }

  await voter.update({ loggedIn: false })

  return voter.get({ plain: true })
}

export const disableTestVoter = async (identifier: string) => {
  const voter = await Voter.findOne({
    where: { identifier },
  })

  if (!voter) {
    return null
  }

  await voter.update({ active: false })

  return voter.get({ plain: true })
}

export const enableTestVoter = async (identifier: string) => {
  const voter = await Voter.findOne({
    where: { identifier },
  })

  if (!voter) {
    return null
  }

  await voter.update({ active: true })

  return voter.get({ plain: true })
}
