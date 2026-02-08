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
})

test('should show preview election form', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Preview' })).toBeVisible()
})

test('should show correct navigation buttons', async ({ page }) => {
  await expect(page.getByRole('button', { name: 'Edit election' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Start voting' })).toBeVisible()
})

test('should show correct election data', async ({ page }) => {
  await expect(page.getByText('Election 1')).toBeVisible()
  await expect(page.getByText('Description 1')).toBeVisible()
  await expect(page.getByText('Seats: 1')).toBeVisible()
  await expect(page.getByText('Candidate 1')).toBeVisible()
})

test('should show voter email box', async ({ page }) => {
  await expect(
    page.getByLabel("Add the voters' email addresses here separated by line breaks")
  ).toBeVisible()
})

test("shouldn't allow starting voting without inputing emails", async ({ page }) => {
  await page.getByRole('button', { name: 'Start voting' }).click()
  await expect(page.getByText('There must be at least one email')).toBeVisible()
})

test('should allow starting voting after inputing emails', async ({ page }) => {
  await page
    .getByLabel("Add the voters' email addresses here separated by line breaks")
    .fill('email@email.com')
  await page.getByRole('button', { name: 'Start voting' }).click()

  await expect(page.getByRole('heading', { name: 'Voting' })).toBeVisible()
})

test('should allow editing election', async ({ page }) => {
  await page.getByRole('button', { name: 'Edit election' }).click()
  await expect(page.getByRole('heading', { name: 'Edit election' })).toBeVisible()
})

test.describe('voter email box', () => {
  test('should only accept valid emails', async ({ page }) => {
    await page
      .getByLabel("Add the voters' email addresses here separated by line breaks")
      .fill('invalid-email')
    await page.getByRole('button', { name: 'Start voting' }).click()
    await expect(page.getByText('Email must be a valid email')).toBeVisible()

    await page
      .getByLabel("Add the voters' email addresses here separated by line breaks")
      .fill('email@email.com')
    await page.getByRole('button', { name: 'Start voting' }).click()
    await expect(page.getByRole('heading', { name: 'Voting' })).toBeVisible()
  })

  test('should allow multiple emails separated by line break', async ({ page }) => {
    await page
      .getByLabel("Add the voters' email addresses here separated by line breaks")
      .fill('email@email.com\nemai2@email.com\nemai3@email.com')
    await page.getByRole('button', { name: 'Start voting' }).click()
    await expect(page.getByRole('heading', { name: 'Voting' })).toBeVisible()
  })
})
