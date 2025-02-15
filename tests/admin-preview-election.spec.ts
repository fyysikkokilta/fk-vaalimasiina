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
})

test('should show preview election form', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Preview' })).toBeVisible()
})

test('should show correct navigation buttons', async ({ page }) => {
  await expect(
    page.getByRole('button', { name: 'Edit election' })
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Start voting' })).toBeVisible()
})

test('should show correct election data', async ({ page }) => {
  await expect(page.locator('text=Election 1')).toBeVisible()
  await expect(page.locator('text=Description 1')).toBeVisible()
  await expect(page.locator('text=Seats: 1')).toBeVisible()
  await expect(page.locator('text=Candidate 1')).toBeVisible()
})

test('should show voter email box', async ({ page }) => {
  await expect(page.locator('#emailList')).toBeVisible()
})

test("shouldn't allow starting voting without inputing emails", async ({
  page
}) => {
  await expect(
    page.getByRole('button', { name: 'Start voting' })
  ).toBeDisabled()
})

test('should allow starting voting after inputing emails', async ({ page }) => {
  await page.fill('#emailList', 'email@email.com')
  await page.click('text=Start voting')

  await expect(page.locator('text=Voting')).toBeVisible()
})

test('should allow editing election', async ({ page }) => {
  await page.click('text=Edit election')
  await expect(page.locator('text=Edit election')).toBeVisible()
})

test.describe('voter email box', () => {
  test('should only accept valid emails', async ({ page }) => {
    await page.fill('#emailList', 'invalid-email')
    await expect(
      page.getByRole('button', { name: 'Start voting' })
    ).toBeDisabled()

    await page.fill('#emailList', 'email@email.com')
    await expect(
      page.getByRole('button', { name: 'Start voting' })
    ).toBeEnabled()
  })

  test('should allow multiple emails separated by line break', async ({
    page
  }) => {
    await page.fill('#emailList', 'email@email.com\nemai2@email.com')
    await expect(
      page.getByRole('button', { name: 'Start voting' })
    ).toBeEnabled()

    await page.fill(
      '#emailList',
      'email@email.com\nemai2@email.com\nemai3@email.com'
    )
    await expect(
      page.getByRole('button', { name: 'Start voting' })
    ).toBeEnabled()
  })
})
