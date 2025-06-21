import type { Ballot, Election } from '~/algorithm/stvAlgorithm'

export function generateCsvContent(
  ballots: Ballot[],
  election: Election
): string {
  const headers = Array.from(
    { length: election.candidates.length },
    (_, i) => `Preference ${i + 1}`
  )

  const rows = ballots.map((ballot) =>
    ballot.votes.map(
      ({ candidateId }) =>
        election.candidates.find((c) => c.candidateId === candidateId)!.name
    )
  )

  const csvContent = [
    headers.join(';'),
    ...rows.map((row) => row.join(';'))
  ].join('\n')

  return csvContent
}

export function generateCsvFileName(election: Election): string {
  const sanitizedTitle = election.title.replace(/[^a-zA-Z0-9-_]/g, '_')
  const dateString = election.date.toISOString().split('T')[0]
  return `${sanitizedTitle}_${dateString}_results.csv`
}
