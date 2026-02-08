import type { Ballot, Election } from '~/algorithm/types'

export function generateCsvContent(ballots: Ballot[], election: Election): string {
  if (election.votingMethod === 'MAJORITY') {
    const headers = ['Vote']
    const rows = ballots.map((ballot) => {
      const sorted = ballot.votes.toSorted((a, b) => a.rank - b.rank)
      const first = sorted[0]
      const name =
        first != null
          ? (election.candidates.find((c) => c.candidateId === first.candidateId)?.name ?? '')
          : 'Abstain'
      return [name]
    })
    return [headers.join(';'), ...rows.map((row) => row.join(';'))].join('\n')
  }

  const headers = Array.from(
    { length: election.candidates.length },
    (_, i) => `Preference ${i + 1}`
  )
  const rows = ballots.map((ballot) =>
    ballot.votes.map(
      ({ candidateId }) => election.candidates.find((c) => c.candidateId === candidateId)!.name
    )
  )
  return [headers.join(';'), ...rows.map((row) => row.join(';'))].join('\n')
}

export function generateCsvFileName(election: Election): string {
  const sanitizedTitle = election.title.replace(/[^a-zA-Z0-9-_]/g, '_')
  const dateString = election.date.toISOString().split('T')[0]
  return `${sanitizedTitle}_${dateString}_results.csv`
}
