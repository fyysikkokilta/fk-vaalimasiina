import Voter from '../../models/voter'

export const changeVoterEmail = async (voterId: string, email: string) => {
  return Voter.update({ email }, { where: { voterId } })
}

export const getVotersForElection = async (electionId: string) => {
  const voters = await Voter.findAll({
    where: { electionId },
    attributes: ['voterId', 'email'],
  })

  return voters.map((voter) => voter.get({ plain: true }))
}

export const getVotersWhoVoted = async (electionId: string) => {
  const voters = await Voter.findAll({
    where: { electionId, hasVoted: true },
    attributes: ['voterId', 'email'],
  })

  return voters.map((voter) => voter.get({ plain: true }))
}
