import { expect, test } from '@playwright/test'

import {
  changeElectionStatus,
  insertElection,
  insertVoters,
  resetDatabase
} from './utils/db'
import { Election, Voter } from '../types/types'

let election: Election
let voters: Voter[]

test.beforeEach(async () => {
  await resetDatabase()
  election = await insertElection({
    title: 'Election 1',
    description: 'Description 1',
    seats: 1,
    candidates: [{ name: 'Candidate 1' }, { name: 'Candidate 2' }],
    status: 'ONGOING'
  })
  voters = await insertVoters({
    electionId: election.electionId,
    emails: Array.from({ length: 1 }, (_, i) => `email${i + 1}@email.com`)
  })
})

test.describe('voting page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/vote/${voters[0].voterId}`)
  })

  test('should show voting view', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Voting' })).toBeVisible()
  })

  test('should show election title', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Election 1' })
    ).toBeVisible()
  })

  test('should show candidate selector', async ({ page }) => {
    await expect(page.getByText('Candidates', { exact: true })).toBeVisible()
    await expect(page.locator('select')).toBeVisible()
    for (const candidate of election.candidates) {
      await expect(
        page.locator(`option[value="${candidate.candidateId}"]`)
      ).toBeAttached()
      await expect(
        page.locator(`option[value="${candidate.candidateId}"]`)
      ).toHaveText(candidate.name)
    }
  })

  test('should show vote button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Vote' })).toBeVisible()
  })
})

test.describe('voting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/vote/${voters[0].voterId}`)
  })

  test('should allow to select candidates', async ({ page }) => {
    await page.selectOption('select', { label: 'Candidate 1' })
    await expect(page.getByText('Candidate 1')).toBeVisible()
  })

  test('should allow to deselect candidates', async ({ page }) => {
    await page.selectOption('select', { label: 'Candidate 1' })
    await expect(page.getByText('Candidate 1')).toBeVisible()

    await expect(page.getByRole('button', { name: 'Remove' })).toBeVisible()
    await page.getByRole('button', { name: 'Remove' }).click()

    await expect(page.getByText('Candidate 1')).not.toBeVisible()
  })

  test('should submit vote', async ({ page }) => {
    await page.selectOption('select', { label: 'Candidate 1' })
    await page.getByRole('button', { name: 'Vote' }).click()

    await expect(page.getByText('You have already voted!')).toBeVisible()
  })

  test('should show ballot id on voting', async ({ page }) => {
    await page.selectOption('select', { label: 'Candidate 1' })

    const responsePromise = page.waitForResponse('**/api/vote')
    await page.getByRole('button', { name: 'Vote' }).click()
    const response = await responsePromise
    const ballotId = (await response.json()) as string

    await expect(page.locator(`text=Ballot ID: ${ballotId}`)).toBeVisible()
  })

  test("shoudn't show ballot id after refreshing the page", async ({
    page
  }) => {
    await page.selectOption('select', { label: 'Candidate 1' })
    await page.getByRole('button', { name: 'Vote' }).click()

    await page.reload()
    await expect(page.getByText('You have already voted!')).toBeVisible()
    await expect(page.locator('text=Ballot ID:')).not.toBeVisible()
  })
})

test.describe('audit view', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/vote/${voters[0].voterId}`)
  })

  test('should show ballot after voting has ended', async ({ page }) => {
    await page.selectOption('select', { label: 'Candidate 1' })
    const responsePromise = page.waitForResponse('**/api/vote')
    await page.getByRole('button', { name: 'Vote' }).click()
    const response = await responsePromise
    const ballotId = (await response.json()) as string

    await expect(page.getByText('You have already voted!')).toBeVisible()
    await changeElectionStatus(election.electionId, 'FINISHED')
    await page.goto('/audit')
    await expect(page.getByRole('heading', { name: 'Auditing' })).toBeVisible()

    await expect(page.getByText(ballotId)).toBeVisible()
    await expect(page.getByText('Candidate 1')).toBeVisible()
  })

  test('should show empty ballot after voting has ended', async ({ page }) => {
    const responsePromise = page.waitForResponse('**/api/vote')
    await page.getByRole('button', { name: 'Vote' }).click()
    const response = await responsePromise
    const ballotId = (await response.json()) as string

    await expect(page.getByText('You have already voted!')).toBeVisible()
    await changeElectionStatus(election.electionId, 'FINISHED')
    await page.goto('/audit')
    await expect(page.getByRole('heading', { name: 'Auditing' })).toBeVisible()

    await expect(page.getByText(ballotId)).toBeVisible()
    await expect(page.getByText('Empty ballot')).toBeVisible()
  })
})
