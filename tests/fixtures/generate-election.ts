import { randomUUID } from 'crypto'
import { CandidateData } from '../../types/types'
import {
  insertElection,
  insertVoters,
  insertVotes,
  resetDatabase
} from '../utils/db'
import { readFixture } from './read-fixture'

const main = async () => {
  const args = process.argv.slice(2)
  if (args.length < 2) {
    console.error(
      'Usage: ts-node generate-election.ts <amountToElect> <voteFileName>'
    )
    process.exit(1)
  }

  const amountToElect = parseInt(args[0], 10)
  const voteFileName = args[1]

  if (isNaN(amountToElect) || amountToElect <= 0) {
    console.error('Invalid amountToElect. It should be a positive integer.')
    process.exit(1)
  }
  const voteFixture = await readFixture(voteFileName)

  await resetDatabase()

  const title = 'Test Election'
  const description = 'Vote for your favorite'
  const candidates = voteFixture.reduce<CandidateData[]>((acc, votes) => {
    votes.forEach((name) => {
      if (!acc.some((c) => c.name === name)) {
        acc.push({ name })
      }
    })
    return acc
  }, [])
  const status = 'CLOSED' as const

  const electionData = {
    title,
    description,
    amountToElect,
    candidates,
    status
  }

  const election = await insertElection(electionData)

  const votersData = voteFixture.map(() => {
    return `${randomUUID()}@mail.com`
  })

  const voters = await insertVoters({
    electionId: election.electionId,
    emails: votersData
  })

  const voterIdBallotPairs = voteFixture.map((votes, index) => {
    const voterId = voters[index].voterId
    const ballot = votes.map((name, preferenceNumber) => ({
      candidateId: election.candidates.find((c) => c.name === name)!
        .candidateId,
      preferenceNumber: preferenceNumber + 1
    }))
    return { voterId, ballot }
  })

  await insertVotes({
    electionId: election.electionId,
    voterIdBallotPairs
  })

  console.log('done')
}

main()
