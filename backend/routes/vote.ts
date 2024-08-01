import { sha512 } from 'js-sha512'
import Vote from '../models/vote'
import { isNoElectionOngoing } from './elections'

export const addVote = async (
  voterId: string,
  electionId: string,
  candidateIds: string[]
) => {
  if (await isNoElectionOngoing(electionId)) {
    return null
  }

  const hashedVoterId = sha512(voterId + process.env.SALT) // Hash the voterId to make the vote anonymous

  return Vote.create({ voterId: hashedVoterId, electionId, candidateIds })
}

export const checkIfAlreadyVoted = async (
  voterId: string,
  electionId: string
) => {
  if (await isNoElectionOngoing(electionId)) {
    return null
  }

  const hashedVoterId = sha512(voterId + process.env.SALT) // Hash the voterId to make the vote anonymous
  const vote = await Vote.findOne({
    where: { voterId: hashedVoterId, electionId },
  })
  return !!vote
}
