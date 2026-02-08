import { expect, test } from '@playwright/test'

import { loginAdmin } from './utils/admin-login'
import { insertElection, resetDatabase } from './utils/db'

test.beforeEach(async ({ page, request }) => {
  await resetDatabase(request)
  await insertElection(
    {
      title: 'Election 1',
      description: 'Description 1',
      seats: 1,
      candidates: [{ name: 'Candidate 1' }],
      status: 'CREATED'
    },
    request
  )
  await loginAdmin(page)
  await page.getByRole('button', { name: 'Edit election' }).click()
})

test('should show modify election form', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Edit election' })).toBeVisible()
})

test('should show correct navigation buttons', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Preview' })).toBeVisible()
})

test('should show correct election data', async ({ page }) => {
  await expect(page.getByLabel('Title')).toHaveValue('Election 1')
  await expect(page.getByLabel('Description')).toHaveValue('Description 1')
  await expect(page.getByLabel('Seats')).toHaveValue('1')
  await expect(page.getByRole('button', { name: 'Remove' })).toHaveCount(1)
  await expect(page.getByText('Candidate 1')).toBeVisible()
})

test('should modify election', async ({ page }) => {
  await page.getByLabel('Title').fill('Election 2')
  await page.getByLabel('Description').fill('Description 2')
  await page.getByLabel('Seats').fill('2')

  await page.getByLabel('New candidate').fill('Candidate 2')
  await page.getByRole('button', { name: 'Add' }).click()
  await expect(page.getByText('Candidate 2')).toBeVisible()

  await page.getByRole('button', { name: 'Preview' }).click()

  await expect(page.getByRole('heading', { name: 'Preview' })).toBeVisible()
  await expect(page.getByText('Election 2')).toBeVisible()
  await expect(page.getByText('Description 2')).toBeVisible()
  await expect(page.getByText('Seats: 2')).toBeVisible()
  await expect(page.getByText('Candidate 1')).toBeVisible()
  await expect(page.getByText('Candidate 2')).toBeVisible()
})

test('should cancel modify election', async ({ page }) => {
  await page.getByLabel('Title').fill('Election 2')
  await page.getByLabel('Description').fill('Description 2')
  await page.getByLabel('Seats').fill('2')

  await page.getByLabel('New candidate').fill('Candidate 2')
  await page.getByRole('button', { name: 'Add' }).click()
  await expect(page.getByText('Candidate 2')).toBeVisible()

  await page.getByRole('button', { name: 'Cancel' }).click()

  await expect(page.getByRole('heading', { name: 'Election 1' })).toBeVisible()
  await expect(page.getByText('Description 1')).toBeVisible()
  await expect(page.getByText('Seats: 1')).toBeVisible()
  await expect(page.getByText('Candidate 1')).toBeVisible()
})
