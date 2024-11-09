import { expect, test } from '@playwright/test'

import { loginAdmin } from './utils/admin-login'
import { insertElection, resetDatabase } from './utils/db'

test.beforeEach(async ({ page }) => {
  await resetDatabase()
  await insertElection({
    title: 'Election 1',
    description: 'Description 1',
    seats: 1,
    candidates: [{ name: 'Candidate 1' }],
    status: 'CREATED'
  })
  await loginAdmin(page)
  await page.getByRole('button', { name: 'Edit election' }).click()
})

test('should show modify election form', async ({ page }) => {
  await expect(
    page.getByRole('heading', { name: 'Edit election' })
  ).toBeVisible()
})

test('should show correct navigation buttons', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Preview' })).toBeVisible()
})

test('should show correct election data', async ({ page }) => {
  await expect(page.locator('#title')).toHaveValue('Election 1')
  await expect(page.locator('#description')).toHaveValue('Description 1')
  await expect(page.locator('#seats')).toHaveValue('1')
  await expect(
    page.getByRole('button', { name: 'Remove candidate' })
  ).toHaveCount(1)
  await expect(page.locator('text=Candidate 1')).toBeVisible()
})

test('should modify election', async ({ page }) => {
  await page.fill('#title', 'Election 2')
  await page.fill('#description', 'Description 2')
  await page.fill('#seats', '2')

  await page.fill('#newCandidate', 'Candidate 2')
  await page.click('text=Add candidate')
  await expect(page.locator('text=Candidate 2')).toBeVisible()

  await page.click('text=Preview')

  await expect(page.getByRole('heading', { name: 'Preview' })).toBeVisible()
  await expect(page.locator('text=Election 2')).toBeVisible()
  await expect(page.locator('text=Description 2')).toBeVisible()
  await expect(page.locator('text=To be elected: 2')).toBeVisible()
  await expect(page.locator('text=Candidate 1')).toBeVisible()
  await expect(page.locator('text=Candidate 2')).toBeVisible()
})

test('should cancel modify election', async ({ page }) => {
  await page.fill('#title', 'Election 2')
  await page.fill('#description', 'Description 2')
  await page.fill('#seats', '2')

  await page.fill('#newCandidate', 'Candidate 2')
  await page.click('text=Add candidate')
  await expect(page.locator('text=Candidate 2')).toBeVisible()

  await page.click('text=Cancel')

  await expect(page.getByRole('heading', { name: 'Election 1' })).toBeVisible()
  await expect(page.locator('text=Description 1')).toBeVisible()
  await expect(page.locator('text=To be elected: 1')).toBeVisible()
  await expect(page.locator('text=Candidate 1')).toBeVisible()
})
