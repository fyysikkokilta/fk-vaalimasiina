import { db } from '../db'
import { Election, VoteData } from '../../../types/types'
import { or } from 'drizzle-orm'

export const getElections = async () => {
  return db.query.electionsTable.findMany({
    with: {
      candidates: true
    }
  })
}

export const getElection = async (electionId: string) => {
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

export const isValidBallot = (
  ballot: VoteData['ballot'],
  election: Election
) => {
  // Check that every candidate in the ballot is a valid candidate
  const validBallot = ballot.every((ballotItem) =>
    election.candidates.some(
      (candidate) =>
        candidate.candidateId === ballotItem.candidateId &&
        candidate.electionId === election.electionId
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

export const findFinishedElectionWithVotes = async () => {
  const election = await db.query.electionsTable.findFirst({
    where: (electionsTable, { eq }) => eq(electionsTable.status, 'FINISHED'),
    with: {
      candidates: true,
      ballots: {
        with: {
          votes: true
        }
      }
    }
  })

  return election || null
}

export const getCompletedElectionWithVotes = async (electionId: string) => {
  const election = await db.query.electionsTable.findFirst({
    where: (electionsTable, { and, eq }) =>
      and(
        eq(electionsTable.electionId, electionId),
        or(
          eq(electionsTable.status, 'FINISHED'),
          eq(electionsTable.status, 'CLOSED')
        )
      ),
    with: {
      candidates: true,
      ballots: {
        with: {
          votes: true
        }
      }
    }
  })

  return election || null
}
