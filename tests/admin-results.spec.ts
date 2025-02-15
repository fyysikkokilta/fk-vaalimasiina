import { expect, test } from '@playwright/test'

import {
  calculateSTVResult,
  ValidVotingResult
} from '../src/algorithm/stvAlgorithm'
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

  result = calculateSTVResult(election, ballots, 100) as ValidVotingResult
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
  const tableInitialDataRow = page.locator('table tr:nth-child(1)').nth(1)
  const tableInitialDataRow2 = page.locator('table tr:nth-child(1)').nth(3)

  await expect(tableInitialDataRow.locator('td:nth-child(1)')).toContainText(
    `${votes}`
  )
  await expect(tableInitialDataRow.locator('td:nth-child(2)')).toContainText(
    `${nonEmptyVotes}`
  )
  await expect(tableInitialDataRow2.locator('td:nth-child(1)')).toContainText(
    `${election.seats}`
  )
  await expect(tableInitialDataRow2.locator('td:nth-child(2)')).toContainText(
    `${result.quota}`
  )
})

test('should show correct round results', async ({ page }) => {
  for (const { candidateResults, round, emptyVotes } of result.roundResults) {
    await page.getByRole('button', { name: 'Next', exact: true }).click()
    const roundContainer = page.locator(`#round-${round}`)
    await expect(roundContainer.locator(`text=Round ${round}`)).toBeVisible()

    const table = roundContainer.locator('table')

    let i = 1
    for (const {
      name,
      voteCount,
      isSelected,
      isSelectedThisRound,
      isEliminated,
      isEliminatedThisRound
    } of candidateResults) {
      const row = table.locator(`tr:nth-child(${i})`)
      await expect(row.locator('td:nth-child(1)')).toContainText(name)
      const votes =
        isEliminated && !isEliminatedThisRound ? '-' : `${voteCount}`
      await expect(row.locator('td:nth-child(2)')).toContainText(votes)
      if (isSelected) {
        const text = isSelectedThisRound ? 'Will be elected' : 'Elected'
        await expect(row.locator('td:nth-child(3)')).toContainText(text)
      }
      if (isEliminated) {
        const text = isEliminatedThisRound ? 'Will be eliminated' : 'Eliminated'
        await expect(row.locator('td:nth-child(3)')).toContainText(text)
      }
      i++
    }

    const lastRow = table.locator(`tr:nth-child(${i})`)
    await expect(lastRow.locator('td:nth-child(1)')).toContainText('Empty')
    await expect(lastRow.locator('td:nth-child(2)')).toContainText(
      `${emptyVotes}`
    )
  }
})

test('should show winners', async ({ page }) => {
  await page
    .getByRole('button', { name: 'Next', exact: true })
    .click({ clickCount: result.roundResults.length + 1 })

  let i = 1
  for (const winner of result.winners) {
    await expect(
      page.locator(`table tr:nth-child(${i}) td:nth-child(1)`)
    ).toHaveText(winner.name)
    i++
  }
})

test('should be able to navigate to next election', async ({ page }) => {
  await page.click('text=Next election')
  await expect(
    page.getByRole('heading', { name: 'New election' })
  ).toBeVisible()
})
