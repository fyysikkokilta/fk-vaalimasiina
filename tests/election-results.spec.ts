import { expect, test } from '@playwright/test'

import { calculateSTVResult, ValidVotingResult } from '../src/algorithm/stvAlgorithm'
import { Ballot, createElectionWithVotersAndBallots, Election, resetDatabase } from './utils/db'

let election: Election
let ballots: Ballot[]
let result: ValidVotingResult

test.beforeEach(async ({ page, request }) => {
  await resetDatabase(request)
  const created = await createElectionWithVotersAndBallots(
    'Public Election',
    'Election description',
    2,
    'CLOSED',
    7,
    100,
    request
  )
  election = created.election
  ballots = created.ballots
  result = calculateSTVResult(election, ballots, 100) as ValidVotingResult

  await page.goto(`/elections/${election.electionId}`)
})

test('should show election title and description', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Public Election' })).toBeVisible()
  await expect(page.getByText('Election description')).toBeVisible()
})

test('should show Back to list link', async ({ page }) => {
  await expect(page.getByRole('link', { name: 'Back to list' })).toBeVisible()
})

test('should show initial votes', async ({ page }) => {
  // Initial votes are now integrated into the table header
  await expect(page.getByText('Initial votes')).toBeVisible()
  await expect(page.locator('#results_by_candidate')).toBeVisible()
})

test('should show correct vote numbers in initial votes', async ({ page }) => {
  const votes = ballots.length
  const nonEmptyVotes = ballots.filter((ballot) => ballot.votes.length > 0).length
  // Initial votes are in the blue section above the table (section, not thead)
  const initialVotesSection = page.locator('#results_by_candidate').locator('section.bg-blue-50')
  await expect(initialVotesSection.getByText(`${votes}`, { exact: true })).toBeVisible()
  await expect(initialVotesSection.getByText(`${nonEmptyVotes}`, { exact: true })).toBeVisible()
  await expect(initialVotesSection.getByText(`${election.seats}`, { exact: true })).toBeVisible()
  await expect(initialVotesSection.getByText(`${result.quota}`, { exact: true })).toBeVisible()
})

test('should show full results by candidate table', async ({ page }) => {
  // Header was removed, table is directly visible
  await expect(page.locator('#results_by_candidate')).toBeVisible()
  await expect(
    page.locator('#results_by_candidate').getByRole('columnheader', { name: 'Candidate' })
  ).toBeVisible()
})

test('should show all candidates in by-candidate table with result column', async ({ page }) => {
  const byCandidateSection = page.locator('#results_by_candidate table')
  await expect(byCandidateSection).toBeVisible()

  const candidateNames = result.roundResults[0].candidateResults.map((c) => c.name)
  for (const name of candidateNames) {
    await expect(byCandidateSection.getByRole('row').filter({ hasText: name })).toBeVisible()
  }

  for (const winner of result.winners) {
    await expect(
      byCandidateSection.getByRole('row').filter({ hasText: winner.name })
    ).toContainText('Elected')
  }
})

test('should show empty votes row in by-candidate table', async ({ page }) => {
  const byCandidateSection = page.locator('#results_by_candidate')
  await expect(byCandidateSection.getByRole('row').filter({ hasText: 'Empty' })).toBeVisible()
})

test('should show winners highlighted in table', async ({ page }) => {
  // In public view, result column is always visible, so winners should be highlighted
  await expect(page.getByRole('columnheader', { name: 'Result' })).toBeVisible()

  // Winners should be visible as highlighted rows in the table
  for (const winner of result.winners) {
    const winnerRow = page
      .locator('#results_by_candidate')
      .getByRole('row')
      .filter({ hasText: winner.name })
    await expect(winnerRow).toBeVisible()
    // Winners should have green background highlighting when results are shown
    await expect(winnerRow).toHaveClass(/bg-green-50/)
  }
})

test('should not show round navigation buttons', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Previous', exact: true })).not.toBeVisible()
  await expect(page.getByRole('button', { name: 'Next', exact: true })).not.toBeVisible()
})

test('should show export actions', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Download ballots as CSV' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Copy results to clipboard' })).toBeVisible()
})
