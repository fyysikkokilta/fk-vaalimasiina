import Candidate from '../../models/candidate'

export const modifyCandidates = async (
  electionId: string,
  candidates: { name: string }[]
) => {
  await Candidate.destroy({ where: { electionId } })
  return Promise.all(
    candidates.map(({ name }) =>
      Candidate.create({ electionId, name }, { returning: true })
    )
  )
}
