import { describe, expect, it } from 'vitest'

import type { Ballot, Election } from './types'
import { calculateMajorityResult } from './majorityAlgorithm'

const createElection = (candidates: string[], seats: number) =>
  ({
    electionId: 'test-election',
    title: 'Test Election',
    description: 'A test election',
    status: 'ONGOING' as const,
    candidates: candidates.map((name, index) => ({
      candidateId: `c${index}`,
      electionId: 'test-election',
      name
    })),
    seats,
    date: new Date(),
    csvFilePath: null,
    votingMethod: 'MAJORITY'
  }) satisfies Election

function createBallot(candidateId: string | null) {
  return {
    votes: candidateId === null ? [] : [{ candidateId, rank: 1 }]
  } satisfies Ballot
}

describe('majorityAlgorithm', () => {
  it('returns invalid result when totalVotes !== voterCount', () => {
    const election = createElection(['Alice', 'Bob'], 1)
    const ballots = [createBallot('c0')]
    const result = calculateMajorityResult(election, ballots, 2)
    expect(result.validResult).toBe(false)
    if (!result.validResult) {
      expect(result.totalVotes).toBe(1)
      expect(result.voterCount).toBe(2)
    }
  })

  it('single winner with one vote', () => {
    const election = createElection(['Alice', 'Bob'], 1)
    const ballots = [createBallot('c0')]
    const result = calculateMajorityResult(election, ballots, 1)
    expect(result.validResult).toBe(true)
    if (result.validResult) {
      expect(result.totalVotes).toBe(1)
      expect(result.nonEmptyVotes).toBe(1)
      expect(result.winners).toEqual([{ id: 'c0', name: 'Alice' }])
      expect(result.candidateResults).toHaveLength(2)
      expect(result.candidateResults.find((c) => c.id === 'c0')?.voteCount).toBe(1)
      expect(result.candidateResults.find((c) => c.id === 'c1')?.voteCount).toBe(0)
    }
  })

  it('single winner with majority of votes', () => {
    const election = createElection(['Alice', 'Bob', 'Carol'], 1)
    const ballots = [createBallot('c0'), createBallot('c0'), createBallot('c1'), createBallot('c2')]
    const result = calculateMajorityResult(election, ballots, 4)
    expect(result.validResult).toBe(true)
    if (result.validResult) {
      expect(result.winners).toEqual([{ id: 'c0', name: 'Alice' }])
      expect(result.candidateResults.find((c) => c.id === 'c0')?.voteCount).toBe(2)
      expect(result.candidateResults.find((c) => c.id === 'c1')?.voteCount).toBe(1)
      expect(result.candidateResults.find((c) => c.id === 'c2')?.voteCount).toBe(1)
    }
  })

  it('multi-winner: top N by vote count', () => {
    const election = createElection(['Alice', 'Bob', 'Carol', 'Dave'], 2)
    const ballots = [
      createBallot('c0'),
      createBallot('c0'),
      createBallot('c1'),
      createBallot('c1'),
      createBallot('c2'),
      createBallot('c3')
    ]
    const result = calculateMajorityResult(election, ballots, 6)
    expect(result.validResult).toBe(true)
    if (result.validResult) {
      expect(result.winners).toHaveLength(2)
      const ids = result.winners.map((w) => w.id).toSorted()
      expect(ids).toEqual(['c0', 'c1'])
    }
  })

  it('counts empty ballots as non-emptyVotes only when they have a choice', () => {
    const election = createElection(['Alice', 'Bob'], 1)
    const ballots = [createBallot('c0'), createBallot(null), createBallot('c1')]
    const result = calculateMajorityResult(election, ballots, 3)
    expect(result.validResult).toBe(true)
    if (result.validResult) {
      expect(result.totalVotes).toBe(3)
      expect(result.nonEmptyVotes).toBe(2)
      expect(result.candidateResults.find((c) => c.id === 'c0')?.voteCount).toBe(1)
      expect(result.candidateResults.find((c) => c.id === 'c1')?.voteCount).toBe(1)
    }
  })

  it('all abstentions: no winners', () => {
    const election = createElection(['Alice', 'Bob'], 1)
    const ballots = [createBallot(null), createBallot(null)]
    const result = calculateMajorityResult(election, ballots, 2)
    expect(result.validResult).toBe(true)
    if (result.validResult) {
      expect(result.nonEmptyVotes).toBe(0)
      expect(result.winners).toEqual([])
      expect(result.candidateResults.every((c) => c.voteCount === 0)).toBe(true)
    }
  })

  it('tie-breaking is deterministic', () => {
    const election = createElection(['Alice', 'Bob'], 1)
    const ballots = [createBallot('c0'), createBallot('c1')]
    const result1 = calculateMajorityResult(election, ballots, 2)
    const result2 = calculateMajorityResult(election, ballots, 2)
    expect(result1.validResult).toBe(true)
    expect(result2.validResult).toBe(true)
    if (result1.validResult && result2.validResult) {
      expect(result1.winners).toEqual(result2.winners)
      expect(result1.winners).toHaveLength(1)
    }
  })

  it('uses first preference only when ballot has multiple ranks', () => {
    const election = createElection(['Alice', 'Bob'], 1)
    const ballot: Ballot = {
      votes: [
        { candidateId: 'c1', rank: 1 },
        { candidateId: 'c0', rank: 2 }
      ]
    }
    const result = calculateMajorityResult(election, [ballot], 1)
    expect(result.validResult).toBe(true)
    if (result.validResult) {
      expect(result.candidateResults.find((c) => c.id === 'c1')?.voteCount).toBe(1)
      expect(result.candidateResults.find((c) => c.id === 'c0')?.voteCount).toBe(0)
    }
  })
})
