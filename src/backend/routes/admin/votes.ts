import Ballot from '../../models/ballot'

export const getVoteCount = async (electionId: string) => {
  return Ballot.count({
    where: { electionId },
  })
}
