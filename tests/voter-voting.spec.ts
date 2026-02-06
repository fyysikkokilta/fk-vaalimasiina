import { expect, test } from '@playwright/test'

import {
  changeElectionStatus,
  Election,
  insertElection,
  insertVoters,
  resetDatabase,
  Voter
} from './utils/db'
import { dragCandidate } from './utils/voter-voting'

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

  test('should allow to select and deselect candidates', async ({ page }) => {
    const candidateNotSelected = page
      .locator('#availableCandidates')
      .getByRole('button', { name: 'Candidate 1' })
    const candidateSelected = page
      .locator('#selectedCandidates')
      .getByRole('button', { name: 'Candidate 1' })

    await dragCandidate(
      page,
      candidateNotSelected,
      page.locator('#selectedCandidates')
    )
    await expect(candidateNotSelected).not.toBeVisible()
    await expect(candidateSelected).toBeVisible()

    await dragCandidate(
      page,
      candidateSelected,
      page.locator('#availableCandidates')
    )
    await expect(candidateSelected).not.toBeVisible()
    await expect(candidateNotSelected).toBeVisible()
  })

  test('should allow to add and remove candidates by double-clicking', async ({
    page
  }) => {
    // Double-click a candidate from available to selected
    const candidateNotSelected = page
      .locator('#availableCandidates')
      .getByRole('button', { name: 'Candidate 1' })
    const candidateSelected = page
      .locator('#selectedCandidates')
      .getByRole('button', { name: 'Candidate 1' })

    await candidateNotSelected.dblclick()

    await expect(candidateSelected).toBeVisible()
    await expect(candidateNotSelected).not.toBeVisible()

    await candidateSelected.dblclick()

    await expect(candidateNotSelected).toBeVisible()
    await expect(candidateSelected).not.toBeVisible()
  })

  test('should allow multiple candidates to be added by double-clicking', async ({
    page
  }) => {
    // Add first candidate
    const candidateNotSelected = page
      .locator('#availableCandidates')
      .getByRole('button', { name: 'Candidate 1' })
    const candidateSelected = page
      .locator('#selectedCandidates')
      .getByRole('button', { name: 'Candidate 1' })
    await candidateNotSelected.dblclick()

    await expect(candidateSelected).toBeVisible()
    await expect(candidateNotSelected).not.toBeVisible()

    // Add second candidate
    const candidate2NotSelected = page
      .locator('#availableCandidates')
      .getByRole('button', { name: 'Candidate 2' })
    const candidate2Selected = page
      .locator('#selectedCandidates')
      .getByRole('button', { name: 'Candidate 2' })
    await candidate2NotSelected.dblclick()

    await expect(candidate2Selected).toBeVisible()
    await expect(candidate2NotSelected).not.toBeVisible()

    // First candidate should be still selected
    await expect(candidateSelected).toBeVisible()
    await expect(candidateNotSelected).not.toBeVisible()
  })

  test('should show confirm vote dialog', async ({ page }) => {
    await dragCandidate(
      page,
      page
        .locator('#availableCandidates')
        .getByRole('button', { name: 'Candidate 1' }),
      page.locator('#selectedCandidates')
    )
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
    await dragCandidate(
      page,
      page
        .locator('#availableCandidates')
        .getByRole('button', { name: 'Candidate 1' }),
      page.locator('#selectedCandidates')
    )
    await page.getByRole('button', { name: 'Vote' }).click()
    await page.getByRole('button', { name: 'Confirm' }).click()

    await expect(page.getByText('Thank you for voting!')).toBeVisible()
  })

  test('should show ballot id copy button after voting', async ({ page }) => {
    await dragCandidate(
      page,
      page
        .locator('#availableCandidates')
        .getByRole('button', { name: 'Candidate 1' }),
      page.locator('#selectedCandidates')
    )

    await page.getByRole('button', { name: 'Vote' }).click()
    await page.getByRole('button', { name: 'Confirm' }).click()

    await expect(
      page.getByRole('button', { name: 'Copy ballot ID' })
    ).toBeVisible()
  })

  test('should copy ballot id after voting', async ({ page }) => {
    await dragCandidate(
      page,
      page
        .locator('#availableCandidates')
        .getByRole('button', { name: 'Candidate 1' }),
      page.locator('#selectedCandidates')
    )

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
    await dragCandidate(
      page,
      page
        .locator('#availableCandidates')
        .getByRole('button', { name: 'Candidate 1' }),
      page.locator('#selectedCandidates')
    )

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
    await expect(page.getByLabel('Search ballot')).toBeVisible()
    await expect(
      page.getByText('Enter a ballot ID to view the ballot')
    ).toBeVisible()
  })

  test('should show ballot when correct ID is entered', async ({
    page,
    request
  }) => {
    await dragCandidate(
      page,
      page
        .locator('#availableCandidates')
        .getByRole('button', { name: 'Candidate 1' }),
      page.locator('#selectedCandidates')
    )
    await page.getByRole('button', { name: 'Vote' }).click()
    await page.getByRole('button', { name: 'Confirm' }).click()
    await page.getByRole('button', { name: 'Copy ballot ID' }).click()
    const ballotId = await page.evaluate(() => navigator.clipboard.readText())

    await expect(page.getByText('Thank you for voting!')).toBeVisible()
    await changeElectionStatus(election.electionId, 'FINISHED', request)
    await page.goto('/audit')
    await expect(page.getByRole('heading', { name: 'Auditing' })).toBeVisible()

    // Search for the ballot
    await page.getByLabel('Search ballot').fill(ballotId)

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
    await page.getByLabel('Search ballot').fill(ballotId)

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
    await page.getByLabel('Search ballot').fill('non-existent-id')

    // Should show error message
    await expect(page.getByText('No ballot found with this ID')).toBeVisible()
  })
})
