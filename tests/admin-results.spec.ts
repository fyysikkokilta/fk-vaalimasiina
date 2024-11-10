import { expect, test } from '@playwright/test'

import { loginAdmin } from './utils/admin-login'
import { createElectionWithVotersAndBallots, resetDatabase } from './utils/db'
import {
  calculateSTVResult,
  VotingResult
} from '../src/frontend/utils/stvAlgorithm'
import { Ballot, Election } from '../types/types'

let election: Election
let ballots: Ballot[]
let result: VotingResult

test.beforeEach(async ({ page }) => {
  await resetDatabase()
  const createdElectionWithVotersAndBallots =
    await createElectionWithVotersAndBallots(
      'Election 1',
      'Description 1',
      2,
      'FINISHED',
      7,
      100
    )
  election = createdElectionWithVotersAndBallots.election
  ballots = createdElectionWithVotersAndBallots.ballots

  result = calculateSTVResult(election, ballots)
  await loginAdmin(page)
})

test('should show results', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible()
})

test('should show correct navigation buttons', async ({ page }) => {
  await expect(
    page.getByRole('button', { name: 'Next election' })
  ).toBeVisible()
})

test('should show correct election title', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Election 1' })).toBeVisible()
})

test('should show correct vote numbers', async ({ page }) => {
  const votes = ballots.length
  const nonEmptyVotes = ballots.filter(
    (ballot) => ballot.votes.length > 0
  ).length
  await expect(page.locator(`text=Votes: ${votes}`)).toBeVisible()
  await expect(
    page.locator(`text=Non-empty votes: ${nonEmptyVotes}`)
  ).toBeVisible()
})

test('should show correct round results', async ({ page }) => {
  for (const { candidateResults, round, emptyVotes } of result.roundResults) {
    const roundContainer = page.locator(`#round-${round}`)
    await expect(roundContainer.locator(`text=Round ${round}`)).toBeVisible()

    await expect(
      roundContainer.getByText(`Election threshold: ${result.quota}`)
    ).toBeVisible()

    await expect(
      roundContainer.locator(`text=Empty: ${emptyVotes}`)
    ).toBeVisible()

    for (const { name, voteCount, isSelected } of candidateResults) {
      const expectedText = `${name} - ${voteCount} votes ${
        isSelected ? '- Elected' : ''
      }`
      await expect(roundContainer.locator(`text=${expectedText}`)).toBeVisible()
    }

    const droppedCandidate = candidateResults.find((c) => c.isEliminated)
    if (droppedCandidate) {
      const expectedText = `${droppedCandidate.name} - ${droppedCandidate.voteCount} votes - Eliminated`

      await expect(roundContainer.locator(`text=${expectedText}`)).toBeVisible()
    }
  }
})

test('should show winners', async ({ page }) => {
  const winnersContainer = page.locator(`#winners`)
  await expect(
    winnersContainer.locator(`text=Elected candidates`)
  ).toBeVisible()
  for (const { name } of result.winners) {
    await expect(winnersContainer.locator(`text=${name}`)).toBeVisible()
  }
})

test('should be able to navigate to next election', async ({ page }) => {
  await page.click('text=Next election')
  await expect(
    page.getByRole('heading', { name: 'New election' })
  ).toBeVisible()
})
