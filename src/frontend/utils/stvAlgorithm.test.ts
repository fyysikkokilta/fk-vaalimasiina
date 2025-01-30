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
})
