import Candidate from '../../models/candidate'

export const createTestCandidates = async (
  electionId: string,
  candidates: { name: string }[]
) => {
  const newCandidates = await Candidate.bulkCreate(
    candidates.map((candidate) => ({
      ...candidate,
      electionId,
    })),
    { returning: true }
  )

  return newCandidates.map((candidate) => candidate.get({ plain: true }))
}
