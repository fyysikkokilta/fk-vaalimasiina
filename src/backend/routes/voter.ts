import Voter from '../models/voter'

export const getVoter = async (voterId: string) => {
  const voterData = await Voter.findByPk(voterId)
  return voterData?.get({ plain: true })
}
