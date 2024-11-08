import Ballot from '../models/ballot'
import Vote from '../models/vote'

export const getVotes = async (electionId: string) => {
  const ballots = await Ballot.findAll({
    where: { electionId },
    include: {
      model: Vote,
      as: 'votes'
    }
  })
  return ballots.map((ballot) => ballot.get({ plain: true }))
}
