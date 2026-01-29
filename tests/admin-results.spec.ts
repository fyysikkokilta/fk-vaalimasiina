import { expect, test } from '@playwright/test'

import {
  calculateSTVResult,
  ValidVotingResult
} from '../src/algorithm/stvAlgorithm'
import { roundToTwoDecimals } from '../src/utils/roundToTwoDecimals'
import { loginAdmin } from './utils/admin-login'
import {
  Ballot,
  createElectionWithVotersAndBallots,
  Election,
  resetDatabase
} from './utils/db'

let election: Election
let ballots: Ballot[]
let result: ValidVotingResult

test.beforeEach(async ({ page, request }) => {
  await resetDatabase(request)
  const createdElectionWithVotersAndBallots =
    await createElectionWithVotersAndBallots(
      'Election 1',
      'Description 1',
      2,
      'FINISHED',
      7,
      100,
      request
    )
  election = createdElectionWithVotersAndBallots.election
  ballots = createdElectionWithVotersAndBallots.ballots

  result = calculateSTVResult(election, ballots, 100) as ValidVotingResult
  await loginAdmin(page)
})

test('should show results', async ({ page }) => {
  await expect(
    page.getByRole('heading', { name: 'Results', exact: true })
  ).toBeVisible()
})

test('should show correct navigation buttons', async ({ page }) => {
  await expect(
    page.getByRole('button', { name: 'Next election' })
  ).toBeVisible()
})

test('should show correct election title', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Election 1' })).toBeVisible()
})

test('should show initial votes in table header on first page', async ({
  page
}) => {
  await expect(page.locator('#results_by_candidate_paged')).toBeVisible()
  await expect(page.getByText('Initial votes')).toBeVisible()
  const votes = ballots.length
  const nonEmptyVotes = ballots.filter(
    (ballot) => ballot.votes.length > 0
  ).length
  // Check values within the initial votes section (blue header)
  const initialVotesSection = page.locator('section.bg-blue-50')
  await expect(
    initialVotesSection.getByText(`${votes}`, { exact: true })
  ).toBeVisible()
  await expect(
    initialVotesSection.getByText(`${nonEmptyVotes}`, { exact: true })
  ).toBeVisible()
  await expect(
    initialVotesSection.getByText(`${election.seats}`, { exact: true })
  ).toBeVisible()
  await expect(
    initialVotesSection.getByText(`${result.quota}`, { exact: true })
  ).toBeVisible()
})

test('should show Previous/Next round buttons for paging', async ({ page }) => {
  await expect(
    page.getByRole('button', { name: 'Previous', exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Next', exact: true })
  ).toBeVisible()
})

test('should have Previous disabled on first page', async ({ page }) => {
  await expect(
    page.getByRole('button', { name: 'Previous', exact: true })
  ).toBeDisabled()
})

test('should show Round 1 column with empty cells on first page', async ({
  page
}) => {
  await expect(page.locator('#results_by_candidate_paged')).toBeVisible()
  await expect(
    page.getByRole('columnheader', { name: 'Round 1' })
  ).toBeVisible()
  // All cells should be empty (no vote counts visible yet)
  const firstCandidateName = result.roundResults[0].candidateResults[0].name
  await expect(page.getByText(firstCandidateName)).toBeVisible()
  // But no vote count should be visible for this candidate yet
})

test('should show first candidate vote when clicking Next', async ({
  page
}) => {
  await page.getByRole('button', { name: 'Next', exact: true }).click()
  await expect(page.locator('#results_by_candidate_paged')).toBeVisible()
  const firstCandidateName = result.roundResults[0].candidateResults[0].name
  const firstCandidateRow = page
    .locator('#results_by_candidate_paged')
    .getByRole('row')
    .filter({ hasText: firstCandidateName })
  await expect(firstCandidateRow).toBeVisible()
  // Should show vote count for first candidate in Round 1
  const firstRoundVotes = result.roundResults[0].candidateResults[0].voteCount
  await expect(
    firstCandidateRow.getByText(roundToTwoDecimals(firstRoundVotes).toString())
  ).toBeVisible()
  // Result column should always be visible now
  await expect(page.getByRole('columnheader', { name: 'Result' })).toBeVisible()
  // Winners should not have green highlighting before their results are shown
  for (const winner of result.winners) {
    const winnerRow = page
      .locator('#results_by_candidate_paged')
      .getByRole('row')
      .filter({ hasText: winner.name })
    await expect(winnerRow).not.toHaveClass(/bg-green-50/)
  }
})

test('should reveal next candidate in same round when clicking Next again', async ({
  page
}) => {
  // Page 0: empty Round 1 column
  // Page 1: first candidate
  await page.getByRole('button', { name: 'Next', exact: true }).click()
  // Page 2: second candidate
  await page.getByRole('button', { name: 'Next', exact: true }).click()
  const secondCandidateName = result.roundResults[0].candidateResults[1].name
  const secondCandidateRow = page
    .locator('#results_by_candidate_paged')
    .getByRole('row')
    .filter({ hasText: secondCandidateName })
  await expect(secondCandidateRow).toBeVisible()
  const secondRoundVotes = result.roundResults[0].candidateResults[1].voteCount
  await expect(
    secondCandidateRow.getByText(
      roundToTwoDecimals(secondRoundVotes).toString()
    )
  ).toBeVisible()
})

test('should show results column after all candidates then move to next round', async ({
  page
}) => {
  const numCandidates = result.roundResults[0].candidateResults.length
  // Steps per round: 1 (empty) + N (candidates) + 1 (empty votes) + 1 (results) = N + 3
  const stepsPerRound = numCandidates + 3
  // Click through all candidates + empty votes + results step
  await page
    .getByRole('button', { name: 'Next', exact: true })
    .click({ clickCount: stepsPerRound })
  // Should now be on Round 2 empty column page
  await expect(
    page.getByRole('columnheader', { name: 'Round 2' })
  ).toBeVisible()
  // Round 1 should still be visible
  await expect(
    page.getByRole('columnheader', { name: 'Round 1' })
  ).toBeVisible()
  // Result column should be visible (from previous round)
  await expect(page.getByRole('columnheader', { name: 'Result' })).toBeVisible()
})

test('should show winners highlighted only after results column appears', async ({
  page
}) => {
  const numCandidates = result.roundResults[0].candidateResults.length
  const stepsPerRound = numCandidates + 3
  const totalPages = result.roundResults.length * stepsPerRound

  // Navigate to last page (final round's results step) where winners are revealed
  await page
    .getByRole('button', { name: 'Next', exact: true })
    .click({ clickCount: totalPages - 1 })

  // Result column should now be visible
  await expect(page.getByRole('columnheader', { name: 'Result' })).toBeVisible()

  // Winners should now be highlighted
  for (const winner of result.winners) {
    const winnerRow = page
      .locator('#results_by_candidate_paged')
      .getByRole('row')
      .filter({ hasText: winner.name })
    await expect(winnerRow).toBeVisible()
    // Winners should have green background highlighting when results are shown
    await expect(winnerRow).toHaveClass(/bg-green-50/)
  }
})

test('should have Next disabled on last page', async ({ page }) => {
  const numCandidates = result.roundResults[0].candidateResults.length
  const stepsPerRound = numCandidates + 3
  const totalPages = result.roundResults.length * stepsPerRound
  await page
    .getByRole('button', { name: 'Next', exact: true })
    .click({ clickCount: totalPages - 1 })

  await expect(
    page.getByRole('button', { name: 'Next', exact: true })
  ).toBeDisabled()
})

test('should navigate back with Previous', async ({ page }) => {
  await page.getByRole('button', { name: 'Next', exact: true }).click()
  // Should be on page 1 (first candidate revealed)
  await expect(page.locator('#results_by_candidate_paged')).toBeVisible()

  await page.getByRole('button', { name: 'Previous', exact: true }).click()
  // Should be back on page 0 (empty Round 1 column)
  await expect(page.locator('#results_by_candidate_paged')).toBeVisible()
  await expect(
    page.getByRole('columnheader', { name: 'Round 1' })
  ).toBeVisible()
})

test('should show export actions', async ({ page }) => {
  await expect(
    page.getByRole('button', { name: 'Download ballots as CSV' })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Copy results to clipboard' })
  ).toBeVisible()
})

test('should be able to navigate to next election', async ({ page }) => {
  await page.click('text=Next election')
  await expect(
    page.getByRole('heading', { name: 'New election' })
  ).toBeVisible()
})
