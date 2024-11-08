import EmailService from '../../emails/handler'
import Voter from '../../models/voter'
import { getElectionById } from '../elections'

export const changeVoterEmail = async (voterId: string, email: string) => {
  const rows = await Voter.update(
    { email },
    { where: { voterId }, returning: true }
  )

  if (rows[0] > 1 || rows[0] === 0) {
    throw new Error('Multiple or no rows were changed')
  }

  const voterData = rows[1][0].get({ plain: true })
  const election = await getElectionById(voterData.electionId)

  await EmailService.sendVotingMail(email, {
    election: election!,
    voterId: voterData.voterId
  })

  return voterData
}

export const getVotersForElection = async (electionId: string) => {
  const voters = await Voter.findAll({
    where: { electionId },
    attributes: ['voterId', 'email']
  })

  return voters.map((voter) => voter.get({ plain: true }))
}

export const getVotersWhoVoted = async (electionId: string) => {
  const voters = await Voter.findAll({
    where: { electionId, hasVoted: true },
    attributes: ['voterId', 'email']
  })

  return voters.map((voter) => voter.get({ plain: true }))
}
