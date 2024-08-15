import { Vote } from '../models/vote'

export const getVotes = async (electionId: string) => {
  return Vote.findAll({ where: { electionId } })
}
