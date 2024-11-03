import Voter from '../models/voter'

export const getVoter = async (voterId: string) => {
  const voterData = await Voter.findByPk(voterId)
  return voterData?.get({ plain: true })
}

export const getVoterByVotingId = async (votingId: string) => {
  const voterData = await Voter.findOne({ where: { votingId } })
  return voterData?.get({ plain: true })
}
