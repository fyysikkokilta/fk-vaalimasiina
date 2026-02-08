import 'dotenv/config'

import { randomUUID } from 'crypto'

import { clearTables } from '../utils/routes/db'
import { createElection } from '../utils/routes/elections'
import { createVoters } from '../utils/routes/voters'
import { createVotes } from '../utils/routes/votes'
import { readFixture } from './read-fixture'

const main = async () => {
  const args = process.argv.slice(2)
  if (args.length < 2) {
    console.error('Usage: tsx generate-election.ts <seats> <voteFileName>')
    process.exit(1)
  }

  const seats = parseInt(args[0], 10)
  const voteFileName = args[1]

  if (isNaN(seats) || seats <= 0) {
    console.error('Invalid seats. It should be a positive integer.')
    process.exit(1)
  }
  const voteFixture = await readFixture(voteFileName)

  await clearTables()

  const title = 'Test Election'
  const description = 'Vote for your favorite'
  const candidates = voteFixture.reduce<{ name: string }[]>((acc, votes) => {
    votes.forEach((name) => {
      if (!acc.some((c) => c.name === name)) {
        acc.push({ name })
      }
    })
    return acc
  }, [])

  const electionData = {
    title,
    description,
    seats,
    candidates,
    status: 'CLOSED' as const
  }

  const election = await createElection(electionData)

  const votersData = voteFixture.map(() => {
    return `${randomUUID()}@mail.com`
  })

  const voters = await createVoters(election.electionId, votersData)

  const voterIdBallotPairs = voteFixture.map((votes, index) => {
    const voterId = voters[index].voterId
    const ballot = votes.map((name, rank) => ({
      candidateId: election.candidates.find((c) => c.name === name)!.candidateId,
      rank: rank + 1
    }))
    return { voterId, ballot }
  })

  await createVotes(election.electionId, voterIdBallotPairs)

  console.log('done')
}

await main()
