export type Voter = {
  voterId: string
  electionId: string
  email: string
  hasVoted: boolean
}

export type VoterData = {
  email: string
}

export type ElectionData = {
  title: string
  description: string
  seats: number
  candidates: CandidateData[]
}

export type ElectionStatus = 'CREATED' | 'ONGOING' | 'FINISHED' | 'CLOSED'

export type Election = {
  electionId: string
  title: string
  description: string
  seats: number
  candidates: Candidate[]
  status: ElectionStatus
}

export type CandidateData = {
  name: string
}

export type Candidate = {
  candidateId: string
  electionId: string
  name: string
}

export type Ballot = {
  ballotId: string
  electionId: string
  votes: { candidateId: string; preferenceNumber: number }[]
}

export type VoteData = {
  electionId: string
  ballot: { candidateId: string; preferenceNumber: number }[]
}
