import { test, expect } from '@playwright/test'
import { loginAdmin } from './utils/admin-login'
import { resetDatabase } from './utils/db'

test.beforeEach(async ({ page, request }) => {
  await resetDatabase(request)
  await loginAdmin(page)
})

test('should show new election form', async ({ page }) => {
  await expect(
    page.getByRole('heading', { name: 'New election' })
  ).toBeVisible()
})

test('should show correct navigation buttons', async ({ page }) => {
  await expect(
    page.getByRole('button', { name: 'Create election' })
  ).toBeVisible()
})

test('should create a new election', async ({ page }) => {
  await page.fill('#title', 'Test Election')
  await page.fill('#description', 'Test Election Description')
  await page.fill('#amountToElect', '1')

  await page.fill('#newCandidate', 'Test Candidate 1')
  await page.click('text=Add candidate')
  await expect(page.locator('text=Test Candidate 1')).toBeVisible()

  await page.fill('#newCandidate', 'Test Candidate 2')
  await page.click('text=Add candidate')
  await expect(page.locator('text=Test Candidate 2')).toBeVisible()

  await page.click('text=Create election')

  await expect(page.getByRole('heading', { name: 'Preview' })).toBeVisible()
})
