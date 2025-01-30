import { describe, expect, it } from 'vitest'

import { Ballot } from '../../../types/types'
import { calculateSTVResult } from './stvAlgorithm'

const createElection = (candidates: string[], seats: number) => ({
  electionId: 'test-election',
  title: 'Test Election',
  description: 'A test election',
  status: 'ONGOING' as const,
  candidates: candidates.map((name, index) => ({
    candidateId: index.toString(),
    electionId: 'test-election',
    name
  })),
  seats
})

const createBallot = (votes: string[]) => ({
  ballotId: 'test-ballot',
  electionId: 'test-election',
  votes: votes.map((candidateId, i) => ({
    candidateId,
    preferenceNumber: i + 1
  }))
})

describe('STV Algorithm', () => {
  it('should select single candidate with no votes', () => {
    const election = createElection(['Alice'], 1)
    const ballots: Ballot[] = []
    const result = calculateSTVResult(election, ballots, 0)
    expect(result).toEqual({
      ballots: [],
      nonEmptyVotes: 0,
      quota: 1,
      roundResults: [
        {
          candidateResults: [
            {
              id: '0',
              isEliminated: false,
              isSelected: true,
              isSelectedThisRound: true,
              name: 'Alice',
              voteCount: 0
            }
          ],
          emptyVotes: 0,
          round: 1
        }
      ],
      totalVotes: 0,
      validResult: true,
      winners: [
        {
          id: '0',
          isEliminated: false,
          isSelected: true,
          isSelectedThisRound: true,
          name: 'Alice',
          voteCount: 0
        }
      ]
    })
  })

  it('should select single candidate with one vote', () => {
    const election = createElection(['Alice'], 1)
    const ballots = [createBallot(['0'])]
    const result = calculateSTVResult(election, ballots, 1)
    expect(result).toEqual({
      ballots: [
        {
          ballotId: 'test-ballot',
          electionId: 'test-election',
          votes: [
            {
              candidateId: '0',
              preferenceNumber: 1
            }
          ]
        }
      ],
      nonEmptyVotes: 1,
      quota: 1,
      roundResults: [
        {
          candidateResults: [
            {
              id: '0',
              isEliminated: false,
              isSelected: true,
              isSelectedThisRound: true,
              name: 'Alice',
              voteCount: 1
            }
          ],
          emptyVotes: 0,
          round: 1
        }
      ],
      totalVotes: 1,
      validResult: true,
      winners: [
        {
          id: '0',
          isEliminated: false,
          isSelected: true,
          isSelectedThisRound: true,
          name: 'Alice',
          voteCount: 1
        }
      ]
    })
  })

  it('should select single candidate from multiple candidates with one vote', () => {
    const election = createElection(['Alice', 'Bob'], 1)
    const ballots = [createBallot(['1'])]
    const result = calculateSTVResult(election, ballots, 1)
    expect(result).toEqual({
      ballots: [
        {
          ballotId: 'test-ballot',
          electionId: 'test-election',
          votes: [
            {
              candidateId: '1',
              preferenceNumber: 1
            }
          ]
        }
      ],
      nonEmptyVotes: 1,
      quota: 1,
      roundResults: [
        {
          candidateResults: [
            {
              id: '0',
              isEliminated: false,
              isSelected: false,
              isSelectedThisRound: false,
              name: 'Alice',
              voteCount: 0
            },
            {
              id: '1',
              isEliminated: false,
              isSelected: true,
              isSelectedThisRound: true,
              name: 'Bob',
              voteCount: 1
            }
          ],
          emptyVotes: 0,
          round: 1
        }
      ],
      totalVotes: 1,
      validResult: true,
      winners: [
        {
          id: '1',
          isEliminated: false,
          isSelected: true,
          isSelectedThisRound: true,
          name: 'Bob',
          voteCount: 1
        }
      ]
    })
  })

  it('should select two candidates from two candidates with one vote', () => {
    const election = createElection(['Alice', 'Bob'], 2)
    const ballots = [createBallot(['1', '0'])]
    const result = calculateSTVResult(election, ballots, 1)
    expect(result).toEqual({
      ballots: [
        {
          ballotId: 'test-ballot',
          electionId: 'test-election',
          votes: [
            {
              candidateId: '1',
              preferenceNumber: 1
            },
            {
              candidateId: '0',
              preferenceNumber: 2
            }
          ]
        }
      ],
      nonEmptyVotes: 1,
      quota: 1,
      roundResults: [
        {
          candidateResults: [
            {
              id: '0',
              isEliminated: false,
              isSelected: true,
              isSelectedThisRound: true,
              name: 'Alice',
              voteCount: 0
            },
            {
              id: '1',
              isEliminated: false,
              isSelected: true,
              isSelectedThisRound: true,
              name: 'Bob',
              voteCount: 1
            }
          ],
          emptyVotes: 0,
          round: 1
        }
      ],
      totalVotes: 1,
      validResult: true,
      winners: [
        {
          id: '0',
          isEliminated: false,
          isSelected: true,
          isSelectedThisRound: true,
          name: 'Alice',
          voteCount: 0
        },
        {
          id: '1',
          isEliminated: false,
          isSelected: true,
          isSelectedThisRound: true,
          name: 'Bob',
          voteCount: 1
        }
      ]
    })
  })

  it('should select two candidates from two candidates with two votes', () => {
    const election = createElection(['Alice', 'Bob'], 2)
    const ballots = [createBallot(['1', '0']), createBallot(['0', '1'])]
    const result = calculateSTVResult(election, ballots, 2)
    expect(result).toEqual({
      ballots: [
        {
          ballotId: 'test-ballot',
          electionId: 'test-election',
          votes: [
            {
              candidateId: '1',
              preferenceNumber: 1
            },
            {
              candidateId: '0',
              preferenceNumber: 2
            }
          ]
        },
        {
          ballotId: 'test-ballot',
          electionId: 'test-election',
          votes: [
            {
              candidateId: '0',
              preferenceNumber: 1
            },
            {
              candidateId: '1',
              preferenceNumber: 2
            }
          ]
        }
      ],
      nonEmptyVotes: 2,
      quota: 1,
      roundResults: [
        {
          candidateResults: [
            {
              id: '0',
              isEliminated: false,
              isSelected: true,
              isSelectedThisRound: true,
              name: 'Alice',
              voteCount: 1
            },
            {
              id: '1',
              isEliminated: false,
              isSelected: true,
              isSelectedThisRound: true,
              name: 'Bob',
              voteCount: 1
            }
          ],
          emptyVotes: 0,
          round: 1
        }
      ],
      totalVotes: 2,
      validResult: true,
      winners: [
        {
          id: '0',
          isEliminated: false,
          isSelected: true,
          isSelectedThisRound: true,
          name: 'Alice',
          voteCount: 1
        },
        {
          id: '1',
          isEliminated: false,
          isSelected: true,
          isSelectedThisRound: true,
          name: 'Bob',
          voteCount: 1
        }
      ]
    })
  })

  it('should select two candidates from three candidates with two votes', () => {
    const election = createElection(['Alice', 'Bob', 'Charlie'], 2)
    const ballots = [createBallot(['1', '0']), createBallot(['0', '1'])]
    const result = calculateSTVResult(election, ballots, 2)
    expect(result).toEqual({
      ballots: [
        {
          ballotId: 'test-ballot',
          electionId: 'test-election',
          votes: [
            {
              candidateId: '1',
              preferenceNumber: 1
            },
            {
              candidateId: '0',
              preferenceNumber: 2
            }
          ]
        },
        {
          ballotId: 'test-ballot',
          electionId: 'test-election',
          votes: [
            {
              candidateId: '0',
              preferenceNumber: 1
            },
            {
              candidateId: '1',
              preferenceNumber: 2
            }
          ]
        }
      ],
      nonEmptyVotes: 2,
      quota: 1,
      roundResults: [
        {
          candidateResults: [
            {
              id: '0',
              isEliminated: false,
              isSelected: true,
              isSelectedThisRound: true,
              name: 'Alice',
              voteCount: 1
            },
            {
              id: '1',
              isEliminated: false,
              isSelected: true,
              isSelectedThisRound: true,
              name: 'Bob',
              voteCount: 1
            },
            {
              id: '2',
              isEliminated: false,
              isSelected: false,
              isSelectedThisRound: false,
              name: 'Charlie',
              voteCount: 0
            }
          ],
          emptyVotes: 0,
          round: 1
        }
      ],
      totalVotes: 2,
      validResult: true,
      winners: [
        {
          id: '0',
          isEliminated: false,
          isSelected: true,
          isSelectedThisRound: true,
          name: 'Alice',
          voteCount: 1
        },
        {
          id: '1',
          isEliminated: false,
          isSelected: true,
          isSelectedThisRound: true,
          name: 'Bob',
          voteCount: 1
        }
      ]
    })
  })

  it('should select correct candidate with multiple candidates and voting rounds', () => {
    const election = createElection(['Alice', 'Bob', 'Charlie'], 2)
    const ballots = [
      createBallot(['1', '0', '2']),
      createBallot(['0', '1', '2']),
      createBallot(['2', '1', '0']),
      createBallot(['1', '2', '0']),
      createBallot(['0', '2', '1']),
      createBallot(['2', '0', '1'])
    ]
    const result = calculateSTVResult(election, ballots, 6)
    expect(result).toEqual({
      ballots: [
        {
          ballotId: 'test-ballot',
          electionId: 'test-election',
          votes: [
            {
              candidateId: '1',
              preferenceNumber: 1
            },
            {
              candidateId: '0',
              preferenceNumber: 2
            },
            {
              candidateId: '2',
              preferenceNumber: 3
            }
          ]
        },
        {
          ballotId: 'test-ballot',
          electionId: 'test-election',
          votes: [
            {
              candidateId: '0',
              preferenceNumber: 1
            },
            {
              candidateId: '1',
              preferenceNumber: 2
            },
            {
              candidateId: '2',
              preferenceNumber: 3
            }
          ]
        },
        {
          ballotId: 'test-ballot',
          electionId: 'test-election',
          votes: [
            {
              candidateId: '2',
              preferenceNumber: 1
            },
            {
              candidateId: '1',
              preferenceNumber: 2
            },
            {
              candidateId: '0',
              preferenceNumber: 3
            }
          ]
        },
        {
          ballotId: 'test-ballot',
          electionId: 'test-election',
          votes: [
            {
              candidateId: '1',
              preferenceNumber: 1
            },
            {
              candidateId: '2',
              preferenceNumber: 2
            },
            {
              candidateId: '0',
              preferenceNumber: 3
            }
          ]
        },
        {
          ballotId: 'test-ballot',
          electionId: 'test-election',
          votes: [
            {
              candidateId: '0',
              preferenceNumber: 1
            },
            {
              candidateId: '2',
              preferenceNumber: 2
            },
            {
              candidateId: '1',
              preferenceNumber: 3
            }
          ]
        },
        {
          ballotId: 'test-ballot',
          electionId: 'test-election',
          votes: [
            {
              candidateId: '2',
              preferenceNumber: 1
            },
            {
              candidateId: '0',
              preferenceNumber: 2
            },
            {
              candidateId: '1',
              preferenceNumber: 3
            }
          ]
        }
      ],
      nonEmptyVotes: 6,
      quota: 3,
      roundResults: [
        {
          candidateResults: [
            {
              id: '0',
              isEliminated: false,
              isSelected: false,
              isSelectedThisRound: false,
              name: 'Alice',
              voteCount: 2
            },
            {
              id: '1',
              isEliminated: false,
              isSelected: false,
              isSelectedThisRound: false,
              name: 'Bob',
              voteCount: 2
            },
            {
              id: '2',
              isEliminated: true,
              isSelected: false,
              isSelectedThisRound: false,
              name: 'Charlie',
              voteCount: 2
            }
          ],
          emptyVotes: 0,
          round: 1,
          tieBreaker: true
        },
        {
          candidateResults: [
            {
              id: '0',
              isEliminated: false,
              isSelected: true,
              isSelectedThisRound: true,
              name: 'Alice',
              voteCount: 3
            },
            {
              id: '1',
              isEliminated: false,
              isSelected: true,
              isSelectedThisRound: true,
              name: 'Bob',
              voteCount: 3
            }
          ],
          emptyVotes: 0,
          round: 2
        }
      ],
      totalVotes: 6,
      validResult: true,
      winners: [
        {
          id: '0',
          isEliminated: false,
          isSelected: true,
          isSelectedThisRound: true,
          name: 'Alice',
          voteCount: 3
        },
        {
          id: '1',
          isEliminated: false,
          isSelected: true,
          isSelectedThisRound: true,
          name: 'Bob',
          voteCount: 3
        }
      ]
    })
  })

  it('should select correct candidates with decimal votes', () => {
    const election = createElection(['Alice', 'Bob', 'Charlie'], 2)
    const ballots = [
      createBallot(['2', '1', '0']),
      createBallot(['0', '1', '2']),
      createBallot(['2', '1', '0']),
      createBallot(['1', '2', '0']),
      createBallot(['0', '2', '1']),
      createBallot(['2', '0', '1']),
      createBallot(['2', '0', '1']),
      createBallot(['0', '1', '2']),
      createBallot(['2', '1', '0']),
      createBallot(['2', '1', '0']),
      createBallot(['2', '0', '1']),
      createBallot(['2', '0', '1'])
    ]
    const result = calculateSTVResult(election, ballots, 12)
    expect(result).toEqual({
      ballots: [
        {
          ballotId: 'test-ballot',
          electionId: 'test-election',
          votes: [
            {
              candidateId: '2',
              preferenceNumber: 1
            },
            {
              candidateId: '1',
              preferenceNumber: 2
            },
            {
              candidateId: '0',
              preferenceNumber: 3
            }
          ]
        },
        {
          ballotId: 'test-ballot',
          electionId: 'test-election',
          votes: [
            {
              candidateId: '0',
              preferenceNumber: 1
            },
            {
              candidateId: '1',
              preferenceNumber: 2
            },
            {
              candidateId: '2',
              preferenceNumber: 3
            }
          ]
        },
        {
          ballotId: 'test-ballot',
          electionId: 'test-election',
          votes: [
            {
              candidateId: '2',
              preferenceNumber: 1
            },
            {
              candidateId: '1',
              preferenceNumber: 2
            },
            {
              candidateId: '0',
              preferenceNumber: 3
            }
          ]
        },
        {
          ballotId: 'test-ballot',
          electionId: 'test-election',
          votes: [
            {
              candidateId: '1',
              preferenceNumber: 1
            },
            {
              candidateId: '2',
              preferenceNumber: 2
            },
            {
              candidateId: '0',
              preferenceNumber: 3
            }
          ]
        },
        {
          ballotId: 'test-ballot',
          electionId: 'test-election',
          votes: [
            {
              candidateId: '0',
              preferenceNumber: 1
            },
            {
              candidateId: '2',
              preferenceNumber: 2
            },
            {
              candidateId: '1',
              preferenceNumber: 3
            }
          ]
        },
        {
          ballotId: 'test-ballot',
          electionId: 'test-election',
          votes: [
            {
              candidateId: '2',
              preferenceNumber: 1
            },
            {
              candidateId: '0',
              preferenceNumber: 2
            },
            {
              candidateId: '1',
              preferenceNumber: 3
            }
          ]
        },
        {
          ballotId: 'test-ballot',
          electionId: 'test-election',
          votes: [
            {
              candidateId: '2',
              preferenceNumber: 1
            },
            {
              candidateId: '0',
              preferenceNumber: 2
            },
            {
              candidateId: '1',
              preferenceNumber: 3
            }
          ]
        },
        {
          ballotId: 'test-ballot',
          electionId: 'test-election',
          votes: [
            {
              candidateId: '0',
              preferenceNumber: 1
            },
            {
              candidateId: '1',
              preferenceNumber: 2
            },
            {
              candidateId: '2',
              preferenceNumber: 3
            }
          ]
        },
        {
          ballotId: 'test-ballot',
          electionId: 'test-election',
          votes: [
            {
              candidateId: '2',
              preferenceNumber: 1
            },
            {
              candidateId: '1',
              preferenceNumber: 2
            },
            {
              candidateId: '0',
              preferenceNumber: 3
            }
          ]
        },
        {
          ballotId: 'test-ballot',
          electionId: 'test-election',
          votes: [
            {
              candidateId: '2',
              preferenceNumber: 1
            },
            {
              candidateId: '1',
              preferenceNumber: 2
            },
            {
              candidateId: '0',
              preferenceNumber: 3
            }
          ]
        },
        {
          ballotId: 'test-ballot',
          electionId: 'test-election',
          votes: [
            {
              candidateId: '2',
              preferenceNumber: 1
            },
            {
              candidateId: '0',
              preferenceNumber: 2
            },
            {
              candidateId: '1',
              preferenceNumber: 3
            }
          ]
        },
        {
          ballotId: 'test-ballot',
          electionId: 'test-election',
          votes: [
            {
              candidateId: '2',
              preferenceNumber: 1
            },
            {
              candidateId: '0',
              preferenceNumber: 2
            },
            {
              candidateId: '1',
              preferenceNumber: 3
            }
          ]
        }
      ],
      nonEmptyVotes: 12,
      quota: 5,
      roundResults: [
        {
          candidateResults: [
            {
              id: '0',
              isEliminated: false,
              isSelected: false,
              isSelectedThisRound: false,
              name: 'Alice',
              voteCount: 3
            },
            {
              id: '1',
              isEliminated: false,
              isSelected: false,
              isSelectedThisRound: false,
              name: 'Bob',
              voteCount: 1
            },
            {
              id: '2',
              isEliminated: false,
              isSelected: true,
              isSelectedThisRound: true,
              name: 'Charlie',
              voteCount: 8
            }
          ],
          emptyVotes: 0,
          round: 1
        },
        {
          candidateResults: [
            {
              id: '0',
              isEliminated: false,
              isSelected: false,
              isSelectedThisRound: false,
              name: 'Alice',
              voteCount: 4.5
            },
            {
              id: '1',
              isEliminated: true,
              isSelected: false,
              isSelectedThisRound: false,
              name: 'Bob',
              voteCount: 2.5
            },
            {
              id: '2',
              isEliminated: false,
              isSelected: true,
              isSelectedThisRound: false,
              name: 'Charlie',
              voteCount: 5
            }
          ],
          emptyVotes: 0,
          round: 2,
          tieBreaker: false
        },
        {
          candidateResults: [
            {
              id: '0',
              isEliminated: false,
              isSelected: true,
              isSelectedThisRound: true,
              name: 'Alice',
              voteCount: 7
            },
            {
              id: '2',
              isEliminated: false,
              isSelected: true,
              isSelectedThisRound: false,
              name: 'Charlie',
              voteCount: 5
            }
          ],
          emptyVotes: 0,
          round: 3
        }
      ],
      totalVotes: 12,
      validResult: true,
      winners: [
        {
          id: '0',
          isEliminated: false,
          isSelected: true,
          isSelectedThisRound: true,
          name: 'Alice',
          voteCount: 7
        },
        {
          id: '2',
          isEliminated: false,
          isSelected: true,
          isSelectedThisRound: false,
          name: 'Charlie',
          voteCount: 5
        }
      ]
    })
  })

  it('should handle more votes than voters', () => {
    const election = createElection(['Alice', 'Bob'], 1)
    const ballots = [
      createBallot(['0']),
      createBallot(['1']),
      createBallot(['0'])
    ]
    const result = calculateSTVResult(election, ballots, 2)
    expect(result.validResult).toBe(false)
  })

  it('should handle tie-breaking between candidates', () => {
    const election = createElection(['Alice', 'Bob', 'Charlie'], 2)
    const ballots = [
      createBallot(['0']),
      createBallot(['1']),
      createBallot(['2'])
    ]
    const result = calculateSTVResult(election, ballots, 3)
    expect(result.validResult).toBe(true)
    if (!result.validResult) return
    expect(result.roundResults[0].tieBreaker).toBe(true)
    expect(
      result.roundResults[0].candidateResults.filter((c) => c.isSelected)
    ).toHaveLength(0)
    expect(
      result.roundResults[1].candidateResults.filter((c) => c.isSelected)
    ).toHaveLength(2)
  })

  it('should handle all empty votes', () => {
    const election = createElection(['Alice', 'Bob'], 1)
    const ballots = [createBallot([]), createBallot([]), createBallot([])]
    const result = calculateSTVResult(election, ballots, 3)
    expect(result.validResult).toBe(true)
    if (!result.validResult) return
    expect(result.roundResults[0].emptyVotes).toBe(3)
  })

  it('should handle exact quota matches', () => {
    const election = createElection(['Alice', 'Bob', 'Charlie'], 2)
    const ballots = [
      createBallot(['0']),
      createBallot(['0']),
      createBallot(['1']),
      createBallot(['1']),
      createBallot(['2'])
    ]
    const result = calculateSTVResult(election, ballots, 5)
    expect(result.validResult).toBe(true)
    if (!result.validResult) return
    expect(result.quota).toBe(2)
    expect(result.winners).toHaveLength(2)
  })

  it('should handle maximum preference numbers', () => {
    const election = createElection(['A', 'B', 'C', 'D', 'E'], 2)
    const ballot = createBallot(['0', '1', '2', '3', '4'])
    const result = calculateSTVResult(election, [ballot], 1)
    expect(result.validResult).toBe(true)
    if (!result.validResult) return
    expect(result.roundResults[0].candidateResults[0].voteCount).toBe(1)
  })

  it('should handle FK Captain 2022', () => {
    const election = createElection(['A', 'B', 'C', 'D', 'E', 'F'], 2)
    const ballots = [
      ['5', '3', '4', '2', '7', '6'],
      ['3', '4', '5', '6', '2', '7'],
      ['3', '4', '6', '7', '5', '2'],
      ['3', '4', '5', '6', '7', '2'],
      ['3', '4', '5', '6', '2', '7'],
      ['3', '4', '5', '6', '7', '2'],
      ['3', '4', '6', '5', '7'],
      ['3', '4', '5', '2', '6', '7'],
      ['3', '4', '6', '2', '5', '7'],
      ['3', '4', '6', '7', '5', '2'],
      ['3', '4', '6', '7', '5', '2'],
      ['3', '4', '6', '2', '7', '5'],
      ['3', '4', '7', '5', '6', '2'],
      ['3', '4', '6', '5', '7', '2'],
      ['3', '4', '5', '6', '7', '2'],
      ['3', '4', '6', '7', '2', '5'],
      ['3', '4', '6', '7', '5', '2'],
      ['3', '4', '6', '5', '7', '2'],
      ['3', '4', '6', '5', '2', '7'],
      ['3', '4', '7', '5', '6', '2'],
      ['3', '4', '6', '5', '2', '7'],
      ['3', '4', '6', '5', '7', '2'],
      ['3', '4', '6', '5', '7', '2'],
      ['3', '4', '6', '5', '7', '2'],
      ['3', '4', '5', '6', '7', '2'],
      ['3', '4', '6', '5', '2', '7'],
      ['3', '5', '4', '6', '2', '7'],
      ['3', '5', '4', '2', '6', '7'],
      ['3', '5', '4', '2', '7', '6'],
      ['3', '5', '4', '6', '2', '7'],
      ['3', '5', '6', '2', '7', '4'],
      ['3', '5', '2', '6', '4', '7'],
      ['3', '5', '2'],
      ['3', '5', '6', '7', '4', '2'],
      ['3', '5', '4', '6', '2', '7'],
      ['3', '5', '4', '6', '7', '2'],
      ['3', '5', '7'],
      ['3', '5'],
      ['3', '7', '5', '6', '2', '4'],
      ['3', '7', '4', '6'],
      ['3', '6', '2', '4', '5', '7'],
      ['3', '6'],
      ['3', '6', '5', '4', '7', '2'],
      ['3', '6', '5', '4', '7'],
      ['3', '6', '5', '4', '7', '2'],
      ['4', '3', '5', '7'],
      ['4', '7', '3'],
      ['4', '3', '6', '5', '2', '7'],
      ['4', '5', '2', '3', '6', '7'],
      ['4', '3', '6', '5', '2', '7'],
      ['4', '6', '2', '3', '5', '7'],
      ['4', '6', '7', '3', '5', '2'],
      ['4', '6', '7', '5', '3', '2'],
      ['4', '7', '5', '3', '2', '6'],
      ['4', '6', '5', '7', '3', '2'],
      ['4', '3', '7', '5', '6', '2'],
      ['4', '6', '7', '3'],
      ['4', '6'],
      ['4', '3', '5', '6', '7', '2'],
      ['4', '6', '3'],
      ['4', '3', '5', '7'],
      ['5', '3', '7', '4', '6', '2'],
      ['5', '7', '4', '6', '3', '2'],
      ['5', '4'],
      ['5', '6', '7', '2', '3', '4'],
      ['5', '4', '6', '3', '7', '2'],
      ['5', '7', '2', '6', '4'],
      ['5', '3', '4', '7', '6', '2'],
      ['5', '4', '2', '3', '7', '6'],
      ['5', '6', '2', '3', '4', '7'],
      ['5', '6', '7', '4', '3', '2'],
      ['6', '4', '3', '2', '7', '5'],
      ['6', '4', '3', '5', '7', '2'],
      ['6', '3', '4', '5'],
      ['6', '2', '4', '7', '3', '5'],
      ['6', '3', '7', '5'],
      ['6', '4', '7', '2', '5', '3'],
      ['6', '3', '4', '7', '2', '5'],
      ['6', '4', '3', '2', '7', '5'],
      ['6', '5'],
      ['6', '4', '3', '2', '7'],
      ['6', '2', '4', '7', '3', '5'],
      ['6', '4', '7', '3', '5', '2'],
      ['6', '4', '7'],
      ['6', '2', '4', '7', '3', '5'],
      ['6', '4', '7', '3', '5', '2'],
      ['6', '4', '7', '5', '3', '2'],
      ['6', '2', '5', '3', '7', '4'],
      ['7', '3', '4', '2', '6', '5'],
      ['7', '3', '4', '6', '5', '2'],
      ['7', '2', '3', '4', '6', '5'],
      ['7', '5', '4', '3', '6', '2'],
      ['7', '5', '3', '4', '2', '6'],
      ['7', '5', '2', '4', '3', '6'],
      ['7', '5', '3', '2', '6', '4'],
      ['7', '5', '4', '2', '3', '6'],
      ['7', '3', '5', '4', '2', '6'],
      ['7', '3', '5', '4', '2', '6'],
      ['7', '3'],
      ['2', '3'],
      ['2', '3', '4', '5'],
      ['2', '4', '3', '6', '5', '7'],
      ['2', '4', '3', '7', '5', '6'],
      ['2', '6', '3', '4', '5', '7'],
      ['4', '3', '7', '2', '5', '6'],
      ['4', '3'],
      ['4', '6', '3', '2', '5'],
      ['4', '3', '5', '2'],
      ['4', '5', '3', '2', '6', '7'],
      ['4', '3', '7'],
      ['4', '5', '6', '3', '7', '2'],
      ['4', '7', '5', '3', '6', '2'],
      ['4', '5', '6'],
      ['4', '3', '5', '6'],
      ['4', '3', '5', '6', '2', '7'],
      ['4', '7', '5', '3', '2', '6'],
      ['4', '3', '6', '7', '5', '2'],
      ['4', '6', '2', '7', '3', '5'],
      ['4', '7'],
      ['4', '3', '5', '6', '2', '7'],
      ['4', '7', '3', '2', '5', '6'],
      ['4', '3', '7', '6'],
      ['4', '3', '6', '5', '7', '2']
    ].map((votes) => createBallot(votes.map((v) => String(Number(v) - 2))))

    const result = calculateSTVResult(election, ballots, 123)

    expect(result.validResult).toBe(true)
    if (!result.validResult) return
    expect(result.winners).toHaveLength(2)
    expect(result.winners[0].id).toBe('1')
    expect(result.winners[1].id).toBe('2')
    expect(result.quota).toBe(42)
    expect(result.roundResults).toHaveLength(4)
    expect(result.roundResults).toEqual([
      {
        candidateResults: [
          {
            id: '0',
            isEliminated: false,
            isSelected: false,
            isSelectedThisRound: false,
            name: 'A',
            voteCount: 5
          },
          {
            id: '1',
            isEliminated: false,
            isSelected: true,
            isSelectedThisRound: true,
            name: 'B',
            voteCount: 44
          },
          {
            id: '2',
            isEliminated: false,
            isSelected: false,
            isSelectedThisRound: false,
            name: 'C',
            voteCount: 35
          },
          {
            id: '3',
            isEliminated: false,
            isSelected: false,
            isSelectedThisRound: false,
            name: 'D',
            voteCount: 11
          },
          {
            id: '4',
            isEliminated: false,
            isSelected: false,
            isSelectedThisRound: false,
            name: 'E',
            voteCount: 17
          },
          {
            id: '5',
            isEliminated: false,
            isSelected: false,
            isSelectedThisRound: false,
            name: 'F',
            voteCount: 11
          }
        ],
        emptyVotes: 0,
        round: 1
      },
      {
        candidateResults: [
          {
            id: '0',
            isEliminated: true,
            isSelected: false,
            isSelectedThisRound: false,
            name: 'A',
            voteCount: 5
          },
          {
            id: '1',
            isEliminated: false,
            isSelected: true,
            isSelectedThisRound: false,
            name: 'B',
            voteCount: 42
          },
          {
            id: '2',
            isEliminated: false,
            isSelected: false,
            isSelectedThisRound: false,
            name: 'C',
            voteCount: 36.13636363636367
          },
          {
            id: '3',
            isEliminated: false,
            isSelected: false,
            isSelectedThisRound: false,
            name: 'D',
            voteCount: 11.54545454545454
          },
          {
            id: '4',
            isEliminated: false,
            isSelected: false,
            isSelectedThisRound: false,
            name: 'E',
            voteCount: 17.227272727272734
          },
          {
            id: '5',
            isEliminated: false,
            isSelected: false,
            isSelectedThisRound: false,
            name: 'F',
            voteCount: 11.09090909090909
          }
        ],
        emptyVotes: -4.263256414560601e-14,
        round: 2,
        tieBreaker: false
      },
      {
        candidateResults: [
          {
            id: '1',
            isEliminated: false,
            isSelected: true,
            isSelectedThisRound: false,
            name: 'B',
            voteCount: 42
          },
          {
            id: '2',
            isEliminated: false,
            isSelected: false,
            isSelectedThisRound: false,
            name: 'C',
            voteCount: 39.13636363636367
          },
          {
            id: '3',
            isEliminated: false,
            isSelected: false,
            isSelectedThisRound: false,
            name: 'D',
            voteCount: 11.54545454545454
          },
          {
            id: '4',
            isEliminated: false,
            isSelected: false,
            isSelectedThisRound: false,
            name: 'E',
            voteCount: 18.227272727272734
          },
          {
            id: '5',
            isEliminated: true,
            isSelected: false,
            isSelectedThisRound: false,
            name: 'F',
            voteCount: 11.09090909090909
          }
        ],
        emptyVotes: 0.9999999999999574,
        round: 3,
        tieBreaker: false
      },
      {
        candidateResults: [
          {
            id: '1',
            isEliminated: false,
            isSelected: true,
            isSelectedThisRound: false,
            name: 'B',
            voteCount: 42
          },
          {
            id: '2',
            isEliminated: false,
            isSelected: true,
            isSelectedThisRound: true,
            name: 'C',
            voteCount: 42.181818181818215
          },
          {
            id: '3',
            isEliminated: false,
            isSelected: false,
            isSelectedThisRound: false,
            name: 'D',
            voteCount: 18.590909090909086
          },
          {
            id: '4',
            isEliminated: false,
            isSelected: false,
            isSelectedThisRound: false,
            name: 'E',
            voteCount: 18.227272727272734
          }
        ],
        emptyVotes: 1.9999999999999574,
        round: 4
      }
    ])
  })
})
