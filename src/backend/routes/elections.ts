import { db } from '../db'
import { VoteData } from '../../../types/types'

export const getElections = async () => {
  return db.query.electionsTable.findMany({
    with: {
      candidates: true
    }
  })
}

export const getElectionById = async (electionId: string) => {
  const election = await db.query.electionsTable.findFirst({
    with: {
      candidates: true
    },
    where: (electionsTable, { eq }) => eq(electionsTable.electionId, electionId)
  })

  return election || null
}

export const isNoElectionOngoing = async (electionId: string) => {
  const election = await db.query.electionsTable.findFirst({
    where: (electionsTable, { eq }) => eq(electionsTable.electionId, electionId)
  })

  return !election || election.status !== 'ONGOING'
}

export const isValidBallot = async (
  electionId: string,
  ballot: VoteData['ballot']
) => {
  const election = await db.query.electionsTable.findFirst({
    with: {
      candidates: true
    },
    where: (electionsTable, { eq }) => eq(electionsTable.electionId, electionId)
  })

  if (!election) {
    return false
  }

  // Check that every candidate in the ballot is a valid candidate
  const validBallot = ballot.every((ballotItem) =>
    election.candidates.some(
      (candidate) =>
        candidate.candidateId === ballotItem.candidateId &&
        candidate.electionId === electionId
    )
  )

  // Validate preference numbers
  const preferenceNumbers = ballot.map((b) => b.preferenceNumber)
  const validPreferenceNumbers = preferenceNumbers.every(
    (preferenceNumber) =>
      preferenceNumber > 0 && preferenceNumber <= election.candidates.length
  )

  return validBallot && validPreferenceNumbers
}

export const checkIsCompletedElection = async (electionId: string) => {
  const election = await db.query.electionsTable.findFirst({
    where: (electionsTable, { eq }) => eq(electionsTable.electionId, electionId)
  })

  return (
    !!election &&
    (election.status === 'FINISHED' || election.status === 'CLOSED')
  )
}

export const checkIsOnGoingElection = async (electionId: string) => {
  const election = await db.query.electionsTable.findFirst({
    where: (electionsTable, { eq }) => eq(electionsTable.electionId, electionId)
  })

  return !!election && election.status === 'ONGOING'
}
