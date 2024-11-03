import { VoteData } from '../../../types/types'
import Candidate from '../models/candidate'
import Election, { ElectionStatus } from '../models/election'

export const getElections = async () => {
  const elections = await Election.findAll({
    include: [
      {
        model: Candidate,
        as: 'candidates',
      },
    ],
  })
  return elections.map((election) => election.get({ plain: true }))
}

export const getElectionById = async (electionId: string) => {
  const election = await Election.findByPk(electionId, {
    include: [
      {
        model: Candidate,
        as: 'candidates',
      },
    ],
  })
  if (!election) {
    return null
  }

  return election.get({ plain: true })
}

export const isNoElectionOngoing = async (electionId: string) => {
  const ongoingElection = await Election.findOne({
    where: { electionId, status: ElectionStatus.ONGOING },
  })

  return !ongoingElection
}

export const isValidBallot = async (
  electionId: string,
  ballot: VoteData['ballot']
) => {
  const electionData = await Election.findByPk(electionId)
  if (!electionData) {
    return false
  }

  const candidatesData = await Candidate.findAll({
    where: { electionId },
  })

  const candidates = candidatesData.map((candidate) =>
    candidate.get({ plain: true })
  )

  // Check that every candidate in the ballot is a valid candidate
  const validBallot = ballot.every((ballotItem) =>
    candidates.some(
      (candidate) =>
        candidate.candidateId === ballotItem.candidateId &&
        candidate.electionId === electionId
    )
  )

  // Validate preference numbers
  const preferenceNumbers = ballot.map((b) => b.preferenceNumber)
  const validPreferenceNumbers = preferenceNumbers.every(
    (preferenceNumber) =>
      preferenceNumber > 0 && preferenceNumber <= candidates.length
  )

  return validBallot && validPreferenceNumbers
}

export const checkIsCompletedElection = async (electionId: string) => {
  const electionData = await Election.findByPk(electionId)
  if (!electionData) {
    return false
  }

  const election = electionData.get({ plain: true })

  return election.status === ElectionStatus.CLOSED
}

export const checkIsOnGoingElection = async (electionId: string) => {
  const electionData = await Election.findByPk(electionId)
  if (!electionData) {
    return false
  }

  const election = electionData.get({ plain: true })

  return election.status === ElectionStatus.ONGOING
}
