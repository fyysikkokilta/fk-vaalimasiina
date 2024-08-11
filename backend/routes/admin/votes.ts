import Vote from '../../models/vote'
import Voter from '../../models/voter'

export const getVotes = async (electionId: string) => {
  return Vote.findAll({ where: { electionId } })
}

export const getVotingStatus = async (electionId: string) => {
  const votes = await Vote.findAll({ where: { electionId } })
  const voters = await Voter.findAll({ where: { active: true } })

  return {
    amountOfVotes: votes.length,
    amountOfVoters: voters.length,
  }
}
