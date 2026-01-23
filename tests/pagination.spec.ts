import { expect, test } from '@playwright/test'

import { createElectionWithVotersAndBallots, resetDatabase } from './utils/db'

test.describe('Election list page', () => {
  test.beforeEach(async ({ page, request }) => {
    await resetDatabase(request)

    // Create multiple closed elections (more than 18)
    for (let i = 1; i <= 25; i++) {
      await createElectionWithVotersAndBallots(
        `Election ${i}`,
        `Description ${i}`,
        2,
        'CLOSED',
        3,
        10,
        request
      )
    }

    await page.goto('/elections')
  })

  test('should show first page of elections by default', async ({ page }) => {
    // Should show first 18 elections
    const electionCards = page.locator('ul li')
    await expect(electionCards).toHaveCount(18)
  })

  test('should show pagination controls when more than 18 elections', async ({
    page
  }) => {
    // Check pagination info
    await expect(page.locator('text=Page 1 / 2')).toBeVisible()

    // Check navigation buttons
    await expect(page.getByRole('button', { name: 'Previous' })).toBeDisabled()
    await expect(
      page.getByRole('button', { name: 'Next', exact: true })
    ).toBeEnabled()
  })

  test('should navigate to second page', async ({ page }) => {
    await page.getByRole('button', { name: 'Next', exact: true }).click()

    // Should show elections 19-25 (7 elections on second page)
    const electionCards = page.locator('ul li')
    await expect(electionCards).toHaveCount(7)

    // Check pagination info updated
    await expect(page.locator('text=Page 2 / 2')).toBeVisible()

    // Check navigation buttons updated
    await expect(page.getByRole('button', { name: 'Previous' })).toBeEnabled()
    await expect(
      page.getByRole('button', { name: 'Next', exact: true })
    ).toBeDisabled()
  })

  test('should navigate back to first page', async ({ page }) => {
    // Go to second page first
    await page.getByRole('button', { name: 'Next', exact: true }).click()
    await expect(page.locator('text=Page 2 / 2')).toBeVisible()

    // Go back to first page
    await page.getByRole('button', { name: 'Previous', exact: true }).click()
    await expect(page.locator('text=Page 1 / 2')).toBeVisible()

    // Check navigation buttons
    await expect(page.getByRole('button', { name: 'Previous' })).toBeDisabled()
    await expect(
      page.getByRole('button', { name: 'Next', exact: true })
    ).toBeEnabled()
  })

  test('should not show pagination when 18 or fewer elections', async ({
    page,
    request
  }) => {
    await resetDatabase(request)

    // Create exactly 18 closed elections
    for (let i = 1; i <= 18; i++) {
      await createElectionWithVotersAndBallots(
        `Election ${i}`,
        `Description ${i}`,
        2,
        'CLOSED',
        3,
        10,
        request
      )
    }

    await page.goto('/elections')

    // Should not show pagination controls
    await expect(page.locator('text=Page')).not.toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Previous' })
    ).not.toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Next', exact: true })
    ).not.toBeVisible()
  })

  test('should show election dates on each card', async ({ page }) => {
    const firstElectionCard = page.locator('ul li').first()
    await expect(
      firstElectionCard.locator(`text=${new Date().getFullYear()}`)
    ).toBeVisible()
  })

  test('should maintain election order (newest first)', async ({ page }) => {
    // First election should be the most recent one
    const firstElectionTitle = await page
      .locator('ul li')
      .first()
      .locator('.font-medium')
      .textContent()
    expect(firstElectionTitle).toContain('Election 25')
  })

  test('should handle clicking on election cards', async ({ page }) => {
    // Click on first election
    await expect(page.locator('ul li a')).toHaveCount(18)
    await page.locator('ul li a').first().click()

    // Should navigate to election detail page
    await expect(page).toHaveURL(/\/elections\/[a-f0-9-]+$/, { timeout: 10000 })
  })
})

test.describe('Pagination component edge cases', () => {
  test('should handle single page correctly', async ({ page, request }) => {
    await resetDatabase(request)

    // Create exactly 1 closed election
    await createElectionWithVotersAndBallots(
      'Single Election',
      'Single Description',
      2,
      'CLOSED',
      3,
      10,
      request
    )

    await page.goto('/elections')

    // Should not show pagination
    await expect(page.locator('text=Page')).not.toBeVisible()
  })

  test('should handle empty results', async ({ page, request }) => {
    await resetDatabase(request)

    await page.goto('/elections')

    // Should show no results message
    await expect(page.locator('text=No previous results')).toBeVisible()
    await expect(
      page.locator('text=There have been no elections held yet')
    ).toBeVisible()

    // Should not show pagination
    await expect(page.locator('text=Page')).not.toBeVisible()
  })

  test('should handle audit page with no finished election', async ({
    page,
    request
  }) => {
    await resetDatabase(request)

    await page.goto('/audit')

    // Should show no finished election message
    await expect(
      page.locator('text=There is no finished election')
    ).toBeVisible()

    // Should not show pagination
    await expect(page.locator('text=Page')).not.toBeVisible()
  })
})
