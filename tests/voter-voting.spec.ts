import { expect, test } from '@playwright/test'

import {
  changeElectionStatus,
  Election,
  insertElection,
  insertVoters,
  resetDatabase,
  Voter
} from './utils/db'
import {
  deselectCandidate,
  doubleClickToAdd,
  doubleClickToRemove,
  selectCandidate
} from './utils/voter-voting'

let election: Election
let voters: Voter[]

test.beforeEach(async ({ request }) => {
  await resetDatabase(request)
  election = await insertElection(
    {
      title: 'Election 1',
      description: 'Description 1',
      seats: 1,
      candidates: [{ name: 'Candidate 1' }, { name: 'Candidate 2' }],
      status: 'ONGOING'
    },
    request
  )
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

  test('should show candidates in available candidates', async ({ page }) => {
    await expect(page.getByText('Candidates', { exact: true })).toBeVisible()
    await expect(page.locator('#availableCandidates')).toBeVisible()
    for (const candidate of election.candidates) {
      await expect(
        page.locator('#availableCandidates').locator(`text=${candidate.name}`)
      ).toBeVisible()
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
    await selectCandidate(page, 'Candidate 1')
    // Selected candidates show with index prefix (e.g., "1. Candidate 1")
    await expect(
      page.locator('#selectedCandidates').getByText('Candidate 1')
    ).toBeVisible()
  })

  test('should allow to deselect candidates', async ({ page }) => {
    await selectCandidate(page, 'Candidate 1')
    // Selected candidates show with index prefix (e.g., "1. Candidate 1")
    await expect(
      page.locator('#selectedCandidates').getByText('Candidate 1')
    ).toBeVisible()

    await deselectCandidate(page, 'Candidate 1')
    await expect(
      page.locator('#availableCandidates').getByText('Candidate 1')
    ).toBeVisible()
  })

  test('should allow to add candidates by double-clicking', async ({
    page
  }) => {
    // Double-click a candidate from available to selected
    await doubleClickToAdd(page, 'Candidate 1')

    // Selected candidates show with index prefix (e.g., "1. Candidate 1")
    await expect(
      page.locator('#selectedCandidates').getByText('Candidate 1')
    ).toBeVisible()

    // Should no longer be in available candidates
    await expect(
      page.locator('#availableCandidates').getByText('Candidate 1')
    ).not.toBeVisible()
  })

  test('should allow to remove candidates by double-clicking', async ({
    page
  }) => {
    // First add a candidate
    await doubleClickToAdd(page, 'Candidate 1')
    await expect(
      page.locator('#selectedCandidates').getByText('Candidate 1')
    ).toBeVisible()

    // Double-click to remove from selected
    await doubleClickToRemove(page, 'Candidate 1')

    // Should be back in available candidates
    await expect(
      page.locator('#availableCandidates').getByText('Candidate 1')
    ).toBeVisible()

    // Should no longer be in selected candidates
    await expect(
      page.locator('#selectedCandidates').getByText('Candidate 1')
    ).not.toBeVisible()
  })

  test('should allow multiple candidates to be added by double-clicking', async ({
    page
  }) => {
    // Add first candidate
    await doubleClickToAdd(page, 'Candidate 1')
    await expect(
      page.locator('#selectedCandidates').getByText('Candidate 1')
    ).toBeVisible()

    // Add second candidate
    await doubleClickToAdd(page, 'Candidate 2')
    await expect(
      page.locator('#selectedCandidates').getByText('Candidate 2')
    ).toBeVisible()

    // Both should be in selected, neither in available
    await expect(
      page.locator('#selectedCandidates').getByText('Candidate 1')
    ).toBeVisible()
    await expect(
      page.locator('#selectedCandidates').getByText('Candidate 2')
    ).toBeVisible()
    await expect(
      page.locator('#availableCandidates').getByText('Candidate 1')
    ).not.toBeVisible()
    await expect(
      page.locator('#availableCandidates').getByText('Candidate 2')
    ).not.toBeVisible()
  })

  test('should show confirm vote dialog', async ({ page }) => {
    await selectCandidate(page, 'Candidate 1')
    await page.getByRole('button', { name: 'Vote' }).click()
    await expect(page.getByText('Vote confirmation')).toBeVisible()
    const modalLocator = page.getByRole('dialog')
    await expect(modalLocator).toBeVisible()
    await expect(
      modalLocator.getByRole('button', { name: 'Confirm' })
    ).toBeVisible()
    await expect(
      modalLocator.getByRole('button', { name: 'Cancel' })
    ).toBeVisible()
    await expect(modalLocator.locator('text=Candidate 1')).toBeVisible()
  })

  test('should submit vote', async ({ page }) => {
    await selectCandidate(page, 'Candidate 1')
    await page.getByRole('button', { name: 'Vote' }).click()
    await page.getByRole('button', { name: 'Confirm' }).click()

    await expect(page.getByText('Thank you for voting!')).toBeVisible()
  })

  test('should show ballot id copy button after voting', async ({ page }) => {
    await selectCandidate(page, 'Candidate 1')

    await page.getByRole('button', { name: 'Vote' }).click()
    await page.getByRole('button', { name: 'Confirm' }).click()

    await expect(
      page.getByRole('button', { name: 'Copy ballot ID' })
    ).toBeVisible()
  })

  test('should copy ballot id after voting', async ({ page }) => {
    await selectCandidate(page, 'Candidate 1')

    await page.getByRole('button', { name: 'Vote' }).click()
    await page.getByRole('button', { name: 'Confirm' }).click()

    await page.getByRole('button', { name: 'Copy ballot ID' }).click()
    await expect(
      page.locator('text=Ballot ID copied to clipboard')
    ).toBeVisible()
  })

  test("shouldn't show copy ballot id button after refreshing page", async ({
    page
  }) => {
    await selectCandidate(page, 'Candidate 1')

    await page.getByRole('button', { name: 'Vote' }).click()
    await expect(page.getByText('Confirm vote')).toBeVisible()
    await page.getByRole('button', { name: 'Confirm' }).click()
    await expect(page.getByText('Thank you for voting!')).toBeVisible()

    await page.reload()
    await expect(page.getByText('You have already voted!')).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Copy ballot ID' })
    ).not.toBeVisible()
  })
})

test.describe('audit view', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`/vote/${voters[0].voterId}`)
  })

  test('should show search bar and placeholder initially', async ({
    page,
    request
  }) => {
    await changeElectionStatus(election.electionId, 'FINISHED', request)
    await page.goto('/audit')
    await expect(page.getByRole('heading', { name: 'Auditing' })).toBeVisible()

    // Should show search input and placeholder text
    await expect(page.locator('#searchBallot')).toBeVisible()
    await expect(
      page.getByText('Enter a ballot ID to view the ballot')
    ).toBeVisible()
  })

  test('should show ballot when correct ID is entered', async ({
    page,
    request
  }) => {
    await selectCandidate(page, 'Candidate 1')
    await page.getByRole('button', { name: 'Vote' }).click()
    await page.getByRole('button', { name: 'Confirm' }).click()
    await page.getByRole('button', { name: 'Copy ballot ID' }).click()
    const ballotId = await page.evaluate(() => navigator.clipboard.readText())

    await expect(page.getByText('Thank you for voting!')).toBeVisible()
    await changeElectionStatus(election.electionId, 'FINISHED', request)
    await page.goto('/audit')
    await expect(page.getByRole('heading', { name: 'Auditing' })).toBeVisible()

    // Search for the ballot
    await page.fill('#searchBallot', ballotId)

    // Should show the ballot (without ID) and the candidate
    await expect(page.getByRole('heading', { name: 'Ballot' })).toBeVisible()
    await expect(page.getByText('Candidate 1')).toBeVisible()
    // Should not show the ballot ID
    await expect(page.getByText(ballotId)).not.toBeVisible()
  })

  test('should show empty ballot when ballot has no votes', async ({
    page,
    request
  }) => {
    await page.getByRole('button', { name: 'Vote' }).click()
    await page.getByRole('button', { name: 'Confirm' }).click()
    await page.getByRole('button', { name: 'Copy ballot ID' }).click()
    const ballotId = await page.evaluate(() => navigator.clipboard.readText())

    await expect(page.getByText('Thank you for voting!')).toBeVisible()
    await changeElectionStatus(election.electionId, 'FINISHED', request)
    await page.goto('/audit')
    await expect(page.getByRole('heading', { name: 'Auditing' })).toBeVisible()

    // Search for the ballot
    await page.fill('#searchBallot', ballotId)

    // Should show empty ballot message
    await expect(page.getByText('Empty ballot')).toBeVisible()
    // Should not show the ballot ID
    await expect(page.getByText(ballotId)).not.toBeVisible()
  })

  test('should show error message when incorrect ID is entered', async ({
    page,
    request
  }) => {
    await changeElectionStatus(election.electionId, 'FINISHED', request)
    await page.goto('/audit')
    await expect(page.getByRole('heading', { name: 'Auditing' })).toBeVisible()

    // Search for non-existent ballot
    await page.fill('#searchBallot', 'non-existent-id')

    // Should show error message
    await expect(page.getByText('No ballot found with this ID')).toBeVisible()
  })
})
