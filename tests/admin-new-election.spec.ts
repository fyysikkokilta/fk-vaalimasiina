import { expect, test } from '@playwright/test'

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
  await page.getByLabel('Title').fill('Test Election')
  await page.getByLabel('Description').fill('Test Election Description')
  await page.getByLabel('Seats').fill('1')

  await page.getByLabel('New candidate').fill('Test Candidate 1')
  await page.getByRole('button', { name: 'Add candidate' }).click()
  await expect(page.getByText('Test Candidate 1')).toBeVisible()

  await page.getByLabel('New candidate').fill('Test Candidate 2')
  await page.getByRole('button', { name: 'Add candidate' }).click()
  await expect(page.getByText('Test Candidate 2')).toBeVisible()

  await page.getByRole('button', { name: 'Create election' }).click()

  await expect(page.getByRole('heading', { name: 'Preview' })).toBeVisible()
})
