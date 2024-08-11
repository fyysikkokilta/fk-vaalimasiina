import Vote from '../../models/vote'

export const getVotes = async (electionId: string) => {
  return Vote.findAll({ where: { electionId } })
}

export const getVoteCount = async (electionId: string) => {
  // Count the number of votes for an election group by ballot ID
  return Vote.count({ where: { electionId }, distinct: true, col: 'ballotId' })
}
