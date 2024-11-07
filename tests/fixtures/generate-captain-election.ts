import { randomUUID } from 'crypto'
import { CandidateData } from '../../types/types'
import {
  insertElection,
  insertVoters,
  insertVotes,
  resetDatabase,
} from '../utils/db'
import { readFixture } from './read-fixture'

const main = async () => {
  const voteFileName = 'captain-votes.csv'
  const voteFixture = await readFixture(voteFileName)

  await resetDatabase()

  const title = 'Captain Election'
  const description = 'Vote for your captain'
  const amountToElect = 2
  const candidates: CandidateData[] = [
    { name: '2' },
    { name: '3' },
    { name: '4' },
    { name: '5' },
    { name: '6' },
    { name: '7' },
  ]
  const status = 'CLOSED' as const

  const electionData = {
    title,
    description,
    amountToElect,
    candidates,
    status,
  }

  const election = await insertElection(electionData)

  const votersData = voteFixture.map(() => {
    return `${randomUUID()}@example.com`
  })

  const voters = await insertVoters({
    electionId: election.electionId,
    emails: votersData,
  })

  const voterIdBallotPairs = voteFixture.map((votes, index) => {
    const voterId = voters[index].voterId
    const ballot = votes.map((name, preferenceNumber) => ({
      candidateId: election.candidates.find((c) => c.name === name)!
        .candidateId,
      preferenceNumber: preferenceNumber + 1,
    }))
    return { voterId, ballot }
  })

  await insertVotes({
    electionId: election.electionId,
    voterIdBallotPairs,
  })

  console.log('done')
}

main()
