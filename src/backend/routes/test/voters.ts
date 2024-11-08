import Voter from '../../models/voter'

export const createTestVoters = async (
  electionId: string,
  emails: string[]
) => {
  const newVoters = await Voter.bulkCreate(
    emails.map((email) => ({
      email,
      electionId,
      hasVoted: false
    })),
    { returning: true }
  )

  return newVoters.map((voter) => voter.get({ plain: true }))
}
