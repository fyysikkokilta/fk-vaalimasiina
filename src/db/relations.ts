import { defineRelations } from 'drizzle-orm'
import * as schema from './schema'

export const relations = defineRelations(schema, (r) => ({
  ballots: {
    election: r.one.elections({
      from: r.ballots.electionId,
      to: r.elections.electionId
    }),
    votes: r.many.votes({
      from: r.ballots.ballotId,
      to: r.votes.ballotId
    })
  },
  elections: {
    ballots: r.many.ballots(),
    candidates: r.many.candidates(),
    voters: r.many.voters()
  },
  candidates: {
    election: r.one.elections({
      from: r.candidates.electionId,
      to: r.elections.electionId
    }),
    votes: r.many.votes({
      from: r.candidates.candidateId,
      to: r.votes.candidateId
    })
  },
  hasVoted: {
    voter: r.one.voters({
      from: r.hasVoted.voterId,
      to: r.voters.voterId
    })
  },
  votes: {
    ballot: r.one.ballots({
      from: r.votes.ballotId,
      to: r.ballots.ballotId
    }),
    candidate: r.one.candidates({
      from: r.votes.candidateId,
      to: r.candidates.candidateId
    })
  },
  voters: {
    hasVoteds: r.many.hasVoted(),
    election: r.one.elections({
      from: r.voters.electionId,
      to: r.elections.electionId
    })
  }
}))
